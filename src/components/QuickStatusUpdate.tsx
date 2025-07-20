
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { useUpdateReport } from "@/hooks/useReports";

interface QuickStatusUpdateProps {
  reportId: string;
  currentStatus: string;
  reportNumber: string;
}

const QuickStatusUpdate = ({ reportId, currentStatus, reportNumber }: QuickStatusUpdateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);
  const updateReportMutation = useUpdateReport();

  const handleUpdate = async () => {
    try {
      await updateReportMutation.mutateAsync({
        id: reportId,
        status: newStatus as any,
        tanggal_selesai: newStatus === 'selesai' && currentStatus !== 'selesai' ? new Date().toISOString() : undefined
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status - {reportNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Status Baru</label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="menunggu">Menunggu</SelectItem>
                <SelectItem value="diproses">Diproses</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
                <SelectItem value="ditolak">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate}
              disabled={updateReportMutation.isPending || newStatus === currentStatus}
              className="flex-1"
            >
              {updateReportMutation.isPending ? "Menyimpan..." : "Update Status"}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickStatusUpdate;
