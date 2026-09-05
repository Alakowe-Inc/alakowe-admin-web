import { useEffect, useMemo, useState } from "react"
import { Truck, Package, ExternalLink, MapPin } from "lucide-react"
import { PageCard } from "@/admin/components/PageCard"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"
import {
  getAdminSpeedafStationsApi,
  getOrderShipmentsByNumberApi,
  initiateInboundShipmentByNumberApi,
  initiateOutboundShipmentByNumberApi,
  type OrderShipmentsDto,
  type ShipmentDto,
} from "@/lib/api/admin/admin.api"

type Props = {
  orderNumber: string
  orderStatus?: string
  sellerName?: string
  sellerPhone?: string
  sellerAddress?: string
  preferredStationId?: number | null
  preferredStationName?: string | null
  preferredStationAddress?: string | null
  preferredStationCity?: string | null
  sellerDropoffScheduledAt?: string | null
  initialShipments?: ShipmentDto[]
  onChanged?: () => void
}

export function SpeedafLogisticsPanel({
  orderNumber,
  orderStatus,
  sellerName,
  sellerPhone,
  sellerAddress,
  preferredStationId,
  preferredStationName,
  preferredStationAddress,
  preferredStationCity,
  sellerDropoffScheduledAt,
  initialShipments = [],
  onChanged,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [outboundStationId, setOutboundStationId] = useState<string>("")
  const [stations, setStations] = useState<Array<{ id: number; siteName: string; city: string; area: string }>>([])
  const [data, setData] = useState<OrderShipmentsDto | null>(() => ({
    orderId: 0,
    orderStatus: orderStatus ?? "",
    usesSpeedaf: initialShipments.length > 0,
    preferredSpeedafStationId: preferredStationId,
    preferredSpeedafStationName: preferredStationName,
    preferredSpeedafStationAddress: preferredStationAddress,
    preferredSpeedafStationCity: preferredStationCity,
    sellerDropoffScheduledAt,
    shipments: initialShipments,
  }))

  useEffect(() => {
    getAdminSpeedafStationsApi()
      .then((list) => {
        setStations(list.map((s) => ({ id: s.id, siteName: s.siteName, city: s.city, area: s.area })))
        const hub = list.find((s) => s.siteName.toUpperCase() === "LOS-IKOSI 2")
        if (hub) setOutboundStationId(String(hub.id))
      })
      .catch(() => {/* ignore */})
  }, [])

  const ketuStations = useMemo(() => {
    const hubFirst = [...stations].sort((a, b) => {
      const aHub = a.siteName.toUpperCase() === "LOS-IKOSI 2" ? 0 : 1
      const bHub = b.siteName.toUpperCase() === "LOS-IKOSI 2" ? 0 : 1
      if (aHub !== bHub) return aHub - bHub
      return a.siteName.localeCompare(b.siteName)
    })
    const near = hubFirst.filter((s) =>
      `${s.city} ${s.area} ${s.siteName}`.toLowerCase().match(/ketu|ikosi|kosofe|ojota|gbagada|maryland|ikeja/),
    )
    return near.length > 0 ? near : hubFirst.slice(0, 25)
  }, [stations])

  const refresh = async () => {
    if (!orderNumber) {
      toast.error("Order number is missing")
      return
    }
    setLoading(true)
    try {
      const res = await getOrderShipmentsByNumberApi(orderNumber)
      setData(res)
    } catch {
      /* toast from client */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setData({
      orderId: 0,
      orderStatus: orderStatus ?? "",
      usesSpeedaf: initialShipments.length > 0,
      preferredSpeedafStationId: preferredStationId,
      preferredSpeedafStationName: preferredStationName,
      preferredSpeedafStationAddress: preferredStationAddress,
      preferredSpeedafStationCity: preferredStationCity,
      sellerDropoffScheduledAt,
      shipments: initialShipments,
    })
  }, [
    initialShipments,
    orderStatus,
    preferredStationId,
    preferredStationName,
    preferredStationAddress,
    preferredStationCity,
    sellerDropoffScheduledAt,
  ])

  const stationId = data?.preferredSpeedafStationId ?? preferredStationId
  const stationName = data?.preferredSpeedafStationName ?? preferredStationName
  const stationAddress = data?.preferredSpeedafStationAddress ?? preferredStationAddress
  const stationCity = data?.preferredSpeedafStationCity ?? preferredStationCity

  const inbound = data?.shipments?.find((s) => s.leg === "Inbound")
  const outbound = data?.shipments?.find((s) => s.leg === "Outbound")
  const statusKey = (data?.orderStatus || orderStatus || "").trim()
  const atOrPastHub = [
    "AtHub",
    "Sorted",
    "OutboundBooked",
    "OutForDelivery",
    "Shipped",
    "Delivered",
  ].includes(statusKey)
  const isDelivered = statusKey === "Delivered"
  const showRetryInbound = !isDelivered && !inbound && !atOrPastHub
  const showBookOutbound = !isDelivered && !outbound

  const bookInboundRetry = async () => {
    if (!orderNumber) return
    if (!sellerPhone?.trim()) {
      toast.error("Seller phone is required before booking inbound")
      return
    }
    if (!stationId && !sellerAddress?.trim()) {
      toast.error("Seller must pick a Speedaf station before inbound can be booked")
      return
    }
    setLoading(true)
    try {
      await initiateInboundShipmentByNumberApi(orderNumber, {
        sellerName: sellerName?.trim(),
        sellerPhone: sellerPhone.trim(),
        sellerAddress: sellerAddress?.trim(),
        speedafStationId: stationId ?? undefined,
      })
      toast.success("Inbound Speedaf waybill created")
      await refresh()
      onChanged?.()
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  const bookOutbound = async () => {
    if (!orderNumber) return
    setLoading(true)
    try {
      await initiateOutboundShipmentByNumberApi(orderNumber, {
        speedafStationId: outboundStationId ? Number(outboundStationId) : undefined,
      })
      toast.success("Outbound Speedaf waybill created — drop at the selected station")
      await refresh()
      onChanged?.()
    } catch {
      /* handled */
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageCard
      title="Speedaf logistics"
      description="Inbound goes seller station → LOS-IKOSI 2 (No 44 Ikosi Road Ketu) for Alakowe pickup. Outbound is optional after sorting."
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order number</p>
            <p className="font-mono text-sm font-semibold text-foreground">{orderNumber}</p>
          </div>
          <Button type="button" variant="outline" disabled={loading} onClick={refresh} className="w-full sm:w-auto">
            Refresh shipments
          </Button>
        </div>

        <div className="rounded-lg border border-border/60 bg-background p-3 text-xs text-muted-foreground space-y-1.5">
          <p className="font-semibold text-foreground">1 · Seller inbound drop-off</p>
          {stationName ? (
            <>
              <p className="inline-flex items-start gap-1.5 text-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>
                  <span className="font-semibold">{stationName}</span>
                  {stationCity ? ` · ${stationCity}` : ""}
                </span>
              </p>
              {stationAddress && <p>{stationAddress}</p>}
              {(data?.sellerDropoffScheduledAt ?? sellerDropoffScheduledAt) && (
                <p>
                  Scheduled{" "}
                  {new Date(data?.sellerDropoffScheduledAt ?? sellerDropoffScheduledAt!).toLocaleString()}
                </p>
              )}
              {inbound?.speedafBillCode && (
                <p className="text-foreground">Waybill: <span className="font-mono font-semibold">{inbound.speedafBillCode}</span></p>
              )}
            </>
          ) : (
            <p>Waiting for seller to schedule a Speedaf station.</p>
          )}
          <div className="pt-1 border-t border-border/40 mt-2">
            <p className="font-semibold text-foreground">Seller contact</p>
            <p>{sellerName || "Seller"} · {sellerPhone || "No phone on record"}</p>
            <p>{sellerAddress || "City/state only"}</p>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-background p-3 text-xs space-y-2">
          <p className="font-semibold text-foreground">2 · Outbound to buyer (optional)</p>
          <p className="text-muted-foreground">
            After sorting at 14b, book Speedaf only if you want them for last-mile. Default drop site is{" "}
            <span className="font-semibold text-foreground">LOS-IKOSI 2</span> (No 44 Ikosi Road Ketu). Speedaf then delivers to the buyer. Otherwise update status manually.
          </p>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Alakowe drop-off station
          </label>
          <select
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            value={outboundStationId}
            onChange={(e) => setOutboundStationId(e.target.value)}
            disabled={!!outbound}
          >
            <option value="">LOS-IKOSI 2 (default hub)</option>
            {ketuStations.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.siteName} — {[s.area, s.city].filter(Boolean).join(", ")}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {showRetryInbound && (
            <Button type="button" variant="outline" disabled={loading || !orderNumber} onClick={bookInboundRetry} className="gap-1.5">
              <Package className="h-4 w-4" /> Retry inbound waybill
            </Button>
          )}
          {showBookOutbound && (
            <Button type="button" disabled={loading || !orderNumber} onClick={bookOutbound} className="gap-1.5">
              <Truck className="h-4 w-4" /> Book outbound (drop at Speedaf → buyer)
            </Button>
          )}
          {!showRetryInbound && !showBookOutbound && (
            <p className="text-xs text-muted-foreground">
              {isDelivered
                ? "Order delivered — Speedaf booking actions are closed."
                : "No Speedaf booking actions available for the current status."}
            </p>
          )}
        </div>

        {data && (
          <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Order status: <span className="font-semibold text-foreground">{data.orderStatus}</span>
              {" · "}
              Uses Speedaf: <span className="font-semibold text-foreground">{data.usesSpeedaf ? "Yes" : "No"}</span>
            </p>
            {(data.shipments ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">No Speedaf shipments yet.</p>
            )}
            {(data.shipments ?? []).map((s) => (
              <div key={s.id} className="rounded-md border border-border/50 bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{s.leg} · {s.status}</p>
                  {s.labelUrl && (
                    <a href={s.labelUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      Label <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Waybill: {s.speedafBillCode ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  Pickup type: {s.pickupType} {s.pickupType === 0 ? "(drop at station)" : ""}
                </p>
                {s.lastTrackMessage && <p className="mt-1 text-xs">{s.lastTrackMessage}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageCard>
  )
}
