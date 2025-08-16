import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardAction,
  CardTitle,
  CardFooter,
  CardContent,
} from "@/components/ui/card";

import { TypeKategori } from "@prisma/client";

export default function KategoriCatalogCard({
  id,
  name,
  type,
  createdBy,
  onDelete,
  onEdit,
}: {
  id: string;
  name: string;
  type: TypeKategori;
  createdBy: string;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  return (
    <Card
      key={id}
      className="@container/card flex flex-col justify-between gap-2"
    >
      <CardHeader>
        <CardDescription>Tipe</CardDescription>
        <CardAction>
          <Badge
            className={
              type === TypeKategori.PEMASUKAN
                ? "bg-sky-800 text-white"
                : "bg-rose-800 text-white"
            }
          >
            {type}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col">
        <CardTitle className="text-lg font-semibold tabular-nums @[250px]/card:text-2xl">
          {name}
        </CardTitle>
      </CardContent>
      <CardFooter className="flex-col items-start justify-between">
        <p className="text-muted-foreground text-sm">
          Dibuat oleh: <span className="font-bold text-white">{createdBy}</span>
        </p>

        <div className="mt-4 flex w-full items-center justify-between gap-2">
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Hapus
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
