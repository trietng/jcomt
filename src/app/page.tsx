"use client"

import type React from "react"

import { useState } from "react"
import { Languages, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pipeline } from "@/lib/pipeline"
import { PanelDetectionAdapter, PanelDetectionInput, PanelDetectionOutput } from "@/lib/cv/panel-detection"
import { DataUrlToPanelDetectionInputAdapter, MatToDataUrlAdapter } from "@/lib/cv/utils"

export default function ImageUploadPage() {
  const [image, setImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true)
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } else {
      setIsUploading(false)
    }
  }

  const handleTranslation = async () => {
    if (!image) return;
    const preprocessor = new DataUrlToPanelDetectionInputAdapter((mat) => {
      const adapter = new MatToDataUrlAdapter();
      adapter.convert(mat).then((dataUrl) => {
        setImage(dataUrl);
      });
    })
    const preprocessed = await preprocessor.convert(image);
    const pipeline = Pipeline.builder<PanelDetectionInput, PanelDetectionOutput>()
      .name("panel_detection")
      .splitter(new PanelDetectionAdapter())
      .build();
    const output = pipeline.run(preprocessed);
    const adapter = new MatToDataUrlAdapter();
    const dataUrl = await adapter.convert(output.panels[1]);
    setImage(dataUrl);
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
          <img src={image || "/placeholder.svg"} alt="Uploaded image" className="object-contain w-full h-full" />
        </div>
      ) : (
        <div className="hidden md:flex w-1/2 h-screen items-center justify-center bg-gray-100 border-l border-gray-200">
          <p className="text-gray-400">Image preview will appear here</p>
        </div>
      )}

      <Button className="absolute size-12 right-0 top-0 cursor-pointer" onClick={() => handleTranslation()}><Languages size={18}/></Button>
    </main>
  )
}
