"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud, File, Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadThing";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

const UploadDropzone = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { startUpload } = useUploadThing("pdfUploader");
  const { toast } = useToast();

  const startPolling = (key) => {
    const keyFinal = key.substring(0, key.length - 4);
    let polling;
    const fetchFile = async () => {
      try {
        const file = await axios.get(`/api/getFile?key=${keyFinal}`);
        if (file && file.data) {
          router.push(`/dashboard/${file.data.id}`);
          clearInterval(polling);
        }
      } catch (error) {
        console.log(error);
      }
    };
    polling = setInterval(fetchFile, 500);
    fetchFile();

    return () => {
      clearInterval(polling);
    };
  };
  const startSimulatedProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);
    return interval;
  };
  return (
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFile) => {
        setIsUploading(true);
        const progressInterval = startSimulatedProgress();
        const res = await startUpload(acceptedFile);
        if (!res) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }
        const [fileResponse] = res;
        const key = fileResponse?.key;
        if (!key) {
          return toast({
            title: "Something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        startPolling(key);
      }}>
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div {...getRootProps()} className="m-4 h-64 rounded-lg border border-dashed border-gray-300">
          <div className="flex h-full w-full items-center justify-center">
            <label htmlFor="dropzone-file" className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pb-6 pt-5">
                <Cloud className="mb-2 h-6 w-6 text-zinc-500" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-zinc-500">PDF (up to 4 MB)</p>
              </div>
              {acceptedFiles && acceptedFiles[0] ? (
                <div className="flex max-w-xs items-center divide-x divide-zinc-200 overflow-hidden rounded-md bg-white outline outline-[1px] outline-zinc-200">
                  <div className="grid h-full place-items-center px-3 py-2">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="h-full truncate px-3 py-2 text-sm">{acceptedFiles[0].name}</div>
                </div>
              ) : null}
              {isUploading ? (
                <div className="mx-auto mt-4 w-full max-w-xs">
                  <Progress indicatorcolor={uploadProgress === 100 ? "bg-green-500" : ""} value={uploadProgress} className="h-1 w-full bg-zinc-200" />
                  {uploadProgress === 100 ? (
                    <div className="flex items-center justify-center gap-1 pt-2 text-center text-sm text-zinc-700">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Redirecting...
                    </div>
                  ) : null}
                </div>
              ) : null}
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v);
        }
      }}>
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>
      <DialogContent>
        <UploadDropzone />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
