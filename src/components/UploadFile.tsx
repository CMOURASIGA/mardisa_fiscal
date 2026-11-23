import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, FileUp, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EnterpriseBanner from "@/components/EnterpriseBanner";
import { useSelectedEnterprise } from "@/hooks/useSelectedEnterprise";
import { cn } from "@/lib/utils";
import api from "@/services/api";

type FileOption = "Compra" | "Venda";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FileUploadPage = () => {
  const { enterpriseId, enterprise, loading: loadingEnterprise } =
    useSelectedEnterprise();

  const [selectedOption, setSelectedOption] = useState<FileOption | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleOptionSelect = (option: FileOption) => {
    setSelectedOption(option);
    setFiles([]);
    setUploadError(null);
    setUploadSuccess(false);
  };

  const addFiles = (incoming: File[]) => {
    const xmlFiles = incoming.filter((file) =>
      file.name.toLowerCase().endsWith(".xml")
    );

    if (xmlFiles.length < incoming.length) {
      const msg = "Apenas arquivos .xml são aceitos.";
      setUploadError(msg);
      toast.error(msg);
    }

    setUploadSuccess(false);
    setFiles((prev) => {
      const known = new Set(prev.map((f) => `${f.name}-${f.size}`));
      return [
        ...prev,
        ...xmlFiles.filter((f) => !known.has(`${f.name}-${f.size}`)),
      ];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!enterpriseId) {
      const msg = "Selecione uma empresa antes de enviar os arquivos.";
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    if (!selectedOption) {
      const msg = "Selecione o tipo de arquivo (Compra ou Venda).";
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    if (!files.length) {
      const msg = "Selecione pelo menos um arquivo.";
      setUploadError(msg);
      toast.error(msg);
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("type", selectedOption.toLowerCase());

    try {
      await api.post(`/upload-xml/${enterpriseId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadSuccess(true);
      setFiles([]);
      toast.success("Arquivos enviados com sucesso!");
    } catch (error: any) {
      console.error("Upload error:", error);

      let msg = "Erro ao enviar arquivos.";
      if (error.response?.data?.message) msg = error.response.data.message;
      else if (error.response?.status === 401)
        msg = "Sessão expirada. Faça login novamente.";

      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <FileUp className="h-6 w-6" />
          Upload de Arquivo
        </h1>
        <p className="text-muted-foreground">
          Envie seus arquivos XML de compra ou venda
        </p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Selecione o tipo de arquivo</CardTitle>
          <CardDescription>
            Escolha Compra ou Venda e envie os arquivos XML
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <EnterpriseBanner enterprise={enterprise} loading={loadingEnterprise} />

          <Tabs
            value={selectedOption ?? ""}
            onValueChange={(value) => handleOptionSelect(value as FileOption)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Compra">Compra</TabsTrigger>
              <TabsTrigger value="Venda">Venda</TabsTrigger>
            </TabsList>
          </Tabs>

          {selectedOption && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-6 text-center transition-colors",
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25"
                )}
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste os arquivos <b className="text-foreground">.xml</b>{" "}
                  aqui ou
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  Selecionar arquivos
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xml"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {files.length > 0 && (
                <ul className="divide-y rounded-md border">
                  {files.map((file, index) => (
                    <li
                      key={`${file.name}-${file.size}`}
                      className="flex items-center gap-3 px-3 py-2"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {file.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remover ${file.name}`}
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>

        {selectedOption && (
          <CardFooter className="flex-col gap-2">
            <Button className="w-full" onClick={handleUpload} disabled={uploading}>
              {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
              {uploading ? "Enviando..." : "Enviar Arquivos"}
            </Button>

            {uploadError && (
              <p role="alert" className="text-center text-sm text-destructive">
                {uploadError}
              </p>
            )}
            {uploadSuccess && (
              <p
                role="status"
                className="text-center text-sm text-green-600 dark:text-green-500"
              >
                Arquivos enviados com sucesso!
              </p>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default FileUploadPage;
