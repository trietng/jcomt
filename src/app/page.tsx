"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Languages, Type, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createWorker, OEM, PSM } from "tesseract.js"
import { mergeColumnBlocks } from "@/lib/ocr/merge"
import { CanvasBlock } from "@/lib/ocr/models"

export default function ImageUploadPage() {
  const [image, setImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [highlightedBlocks, setHighlightedBlocks] = useState<CanvasBlock[]>([])
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHighlightedBlocks([]);
    setIsUploading(true)
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        event.target.value = '';
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } else {
      setIsUploading(false)
    }
  }

  const handleOCR = async () => {
    if (!image) return;
    // execute OCR
    const worker = await createWorker("eng", OEM.TESSERACT_LSTM_COMBINED);
    worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO_OSD })
    const { data: { blocks }} = await worker.recognize(image, {}, { blocks: true });
    console.log("OCR completed");
    if (blocks) {
      const ocrResult = mergeColumnBlocks(blocks);
      setHighlightedBlocks(ocrResult);
    }
    await worker.terminate();
  }

  const handleTranslation = async () => {
    if (!image) return;
    
  }

  return (
    <main className="flex min-h-screen bg-gray-50">
      {/* Left side with upload button */}
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="w-full max-w-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Image Upload</h1>

          <div className="flex flex-col items-center">
            <div className="relative">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageUpload}
              />
              <Button className="w-48 h-12 gap-2" disabled={isUploading}>
                <Upload size={18} />
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>

            {!image && <p className="text-sm text-gray-500 mt-4">Select an image to see it displayed on the right</p>}
          </div>
        </Card>
      </div>

      {/* Right side with image preview */}
      {image ? (
        <div className="w-1/2 h-screen relative border-l border-gray-200">
          <img src={image || "/placeholder.svg"} alt="Uploaded image" className="object-contain w-full h-full relative" ref={imageRef}/>
        </div>
      ) : (
        <div className="hidden md:flex w-1/2 h-screen items-center justify-center bg-gray-100 border-l border-gray-200">
          <p className="text-gray-400">Image preview will appear here</p>
        </div>
      )}
      <div className="flex flex-col gap-2 p-2 absolute right-0 top-0 bg-black/20 rounded-md">
        <Button className="size-12 cursor-pointer" onClick={() => handleOCR()}><Type size={18}/></Button>
        <Button className="size-12 cursor-pointer" onClick={() => handleTranslation()}><Languages size={18}/></Button>
      </div>
    </main>
  )
}