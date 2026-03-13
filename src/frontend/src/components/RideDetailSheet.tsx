import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Clock, MapPin, Pencil, Trash2, TrendingUp } from "lucide-react";
import { getTranslations } from "../i18n";
import { PLATFORM_COLORS } from "../pages/HistoryPage";
import type { Ride } from "../store/useStore";
import { useStore } from "../store/useStore";

interface RideDetailSheetProps {
  ride: Ride | null;
  open: boolean;
  onClose: () => void;
  onEdit: (ride: Ride) => void;
}

export default function RideDetailSheet({
  ride,
  open,
  onClose,
  onEdit,
}: RideDetailSheetProps) {
  const { deleteRide, settings, formatAmount } = useStore();
  const t = getTranslations(settings.language);

  if (!ride) return null;

  const handleDelete = () => {
    deleteRide(ride.id);
    onClose();
  };

  const dt = new Date(ride.datetime);
  const dateStr = dt.toLocaleDateString();
  const timeStr = dt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const color = PLATFORM_COLORS[ride.platform] || "#6b7280";

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-white text-sm font-bold"
              style={{ background: color }}
            >
              {ride.platform}
            </span>
            <span className="text-sm text-muted-foreground">
              {dateStr} {timeStr}
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Income summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">{t.common.fare}</p>
              <p className="text-lg font-bold">{formatAmount(ride.fare)}</p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Commission</p>
              <p className="text-lg font-bold text-destructive">
                {formatAmount(ride.commission)}
              </p>
            </div>
            <div className="bg-muted rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">{t.common.net}</p>
              <p
                className="text-lg font-bold"
                style={{ color: "oklch(0.65 0.15 142)" }}
              >
                {formatAmount(ride.netIncome)}
              </p>
            </div>
          </div>

          {ride.tips > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp size={16} style={{ color: "oklch(0.72 0.19 47)" }} />
              <span>Tips: {formatAmount(ride.tips)}</span>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm">
            <MapPin
              size={16}
              className="mt-0.5 text-muted-foreground flex-shrink-0"
            />
            <div>
              <p>{ride.pickupArea || "N/A"}</p>
              <p className="text-muted-foreground">
                → {ride.dropArea || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-muted-foreground" />
            <span>
              {dateStr} at {timeStr}
            </span>
          </div>

          <Badge variant="outline">{ride.distance} km</Badge>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl gap-2"
              onClick={() => {
                onEdit(ride);
                onClose();
              }}
              data-ocid="history.ride.edit_button"
            >
              <Pencil size={16} />
              {t.history.editRide}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="flex-1 h-12 rounded-xl gap-2"
                  data-ocid="history.ride.delete_button"
                >
                  <Trash2 size={16} />
                  {t.history.deleteRide}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Ride?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.history.confirmDelete}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="history.ride.cancel_button">
                    {t.common.cancel}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-ocid="history.ride.confirm_button"
                    onClick={handleDelete}
                  >
                    {t.common.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
