import { useState } from "react";
import { toast } from "sonner";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnterpriseBanner from "@/components/EnterpriseBanner";
import { useSelectedEnterprise } from "@/hooks/useSelectedEnterprise";
import { downloadBlob } from "@/lib/utils";
import api from "@/services/api";

type GenerateOption = "Produto" | "Pedido";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 2000;
const MAX_YEAR = CURRENT_YEAR + 1;

/** Erros de download chegam como Blob (responseType: "blob") — extrai o JSON. */
const readErrorMessage = async (error: any, fallback: string) => {
  try {
    const data = error?.response?.data;
    if (data instanceof Blob) {
      const json = JSON.parse(await data.text());
      return json.error || json.message || fallback;
    }
    if (data?.error) return data.error;
    if (data?.message) return data.message;
    if (error?.response?.status === 401)
      return "Sessão expirada. Faça login novamente.";
    return fallback;
  } catch {
    return fallback;
  }
};

const FileDownloadPage = () => {
  const { enterpriseId, enterprise, loading: loadingEnterprise } =
    useSelectedEnterprise();

  const [selectedOption, setSelectedOption] = useState<GenerateOption | null>(
    null
  );
  const [month, setMonth] = useState<number | "">("");
  const [year, setYear] = useState<number | "">("");
  const [generating, setGenerating] = useState<"produto" | "pedido" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const fail = (msg: string) => {
    setError(msg);
    toast.error(msg);
  };

  const generateProdutoFile = async () => {
    if (!enterpriseId)
      return fail("Selecione uma empresa antes de gerar o arquivo.");

    setGenerating("produto");
    setError(null);
    try {
      const response = await api.get(`/download/bulk_v1/${enterpriseId}`, {
        responseType: "blob",
      });
      downloadBlob(response.data, "produto_file.zip");
      toast.success("Arquivo gerado com sucesso!");
    } catch (err: any) {
      console.error(err);
      fail(
        await readErrorMessage(
          err,
          "Erro ao gerar arquivo. Verifique se existem notas."
        )
      );
    } finally {
      setGenerating(null);
    }
  };

  const generatePedidoFile = async () => {
    if (!enterpriseId)
      return fail("Selecione uma empresa antes de gerar o arquivo.");
    if (month === "" || year === "")
      return fail("Selecione o mês e o ano.");

    setGenerating("pedido");
    setError(null);
    try {
      const response = await api.get(
        `/download/bulk_v2/${enterpriseId}?month=${month}&year=${year}`,
        { responseType: "blob" }
      );
      downloadBlob(response.data, `pedido_${month}_${year}.zip`);
      toast.success("Arquivo gerado com sucesso!");
    } catch (err: any) {
      console.error(err);
      fail(await readErrorMessage(err, "Erro ao gerar arquivo de pedido."));
    } finally {
      setGenerating(null);
    }
  };

  const isPedidoFormValid =
    month !== "" &&
    year !== "" &&
    month >= 1 &&
    month <= 12 &&
    year >= MIN_YEAR &&
    year <= MAX_YEAR;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <FileDown className="h-6 w-6" />
          Geração de Arquivo
        </h1>
        <p className="text-muted-foreground">
          Gere os arquivos de produto e pedido
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Escolha o tipo de arquivo a gerar</CardTitle>
          <CardDescription>
            Selecione Produto ou Pedido e informe os dados
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <EnterpriseBanner enterprise={enterprise} loading={loadingEnterprise} />

          <Tabs
            value={selectedOption ?? ""}
            onValueChange={(value) => {
              setSelectedOption(value as GenerateOption);
              setError(null);
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Produto">Produto</TabsTrigger>
              <TabsTrigger value="Pedido">Pedido</TabsTrigger>
            </TabsList>
          </Tabs>

          {selectedOption === "Produto" && (
            <Button
              className="w-full"
              onClick={generateProdutoFile}
              disabled={generating !== null}
            >
              {generating === "produto" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Gerar Arquivo Produto
            </Button>
          )}

          {selectedOption === "Pedido" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Mês</Label>
                  <Select
                    value={month !== "" ? String(month) : undefined}
                    onValueChange={(value) => setMonth(Number(value))}
                  >
                    <SelectTrigger id="month" className="w-full">
                      <SelectValue placeholder="Mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES.map((nome, i) => (
                        <SelectItem key={nome} value={String(i + 1)}>
                          {nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    type="number"
                    inputMode="numeric"
                    min={MIN_YEAR}
                    max={MAX_YEAR}
                    placeholder="Ex.: 2025"
                    value={year}
                    onChange={(e) =>
                      setYear(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={generatePedidoFile}
                disabled={!isPedidoFormValid || generating !== null}
              >
                {generating === "pedido" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Gerar Arquivo Pedido
              </Button>
            </div>
          )}
        </CardContent>

        {error && (
          <CardFooter>
            <p role="alert" className="w-full text-center text-sm text-destructive">
              {error}
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default FileDownloadPage;
