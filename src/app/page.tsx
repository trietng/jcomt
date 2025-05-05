"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Languages, Save, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { fake } from "@/lib/utils"
import { Translation } from "@/lib/common/model"
import { drawTranslations } from "@/lib/canvas/draw"

type IndexStatus = "idle" | "loading" | "translated"

const doTranslate = fake<Translation[]>([
  {
    "box_2d": [
      52,
      118,
      256,
      294
    ],
    "text": "ARE\nYOU NOT\nAFRAID\nOF DYING,\nHEITER?",
    "translated_text": "ÔNG KHÔNG\nSỢ CHẾT SAO,\nHEITER?"
  },
  {
    "box_2d": [
      52,
      812,
      296,
      957
    ],
    "text": "IF YOU\nHAPPEN\nTO VISIT\nTHE HOLY\nCITY...\n\n...LEAVE\nSOME\nBOTTLES\nAT MY\nGRAVE.",
    "translated_text": "NẾU CÔ CÓ GHÉ\nTHÁNH ĐÔ...\n\n...THÌ ĐỂ LẠI\nMẤY CHAI\nTRÊN MỘ TÔI\nNHÉ."
  },
  {
    "box_2d": [
      576,
      817,
      714,
      954
    ],
    "text": "WE\nARE THE\nPARTY OF\nHEROES\nTHAT\nSAVED\nTHE\nWORLD.",
    "translated_text": "CHÚNG TA LÀ\nTỔ ĐỘI ANH HÙNG\nĐÃ GIẢI CỨU\nTHẾ GIỚI."
  },
  {
    "box_2d": [
      739,
      827,
      887,
      957
    ],
    "text": "I\nKNOW\nWE'LL\nLIVE IN\nLUXURY\nIN HEAVEN\nAFTER WE\nDIE.",
    "translated_text": "TÔI BIẾT CHÚNG\nTA SẼ SỐNG\nTRONG XA HOA\nTRÊN THIÊN ĐÀNG\nSAU KHI CHẾT."
  },
  {
    "box_2d": [
      695,
      481,
      785,
      602
    ],
    "text": "THAT'S\nTHE\nWHOLE\nREASON...",
    "translated_text": "ĐÓ LÀ\nTOÀN BỘ\nLÝ DO..."
  },
  {
    "box_2d": [
      804,
      82,
      887,
      247
    ],
    "text": "...I\nFOUGHT\nALONGSIDE\nYOU.",
    "translated_text": "...TÔI ĐÃ\nCHIẾN ĐẤU\nCÙNG ÔNG."
  }
]);

export default function IndexPage() {
  const [image, setImage] = useState<string | null>(null)
  const [status, setStatus] = useState<IndexStatus>("idle")
  const imageRef = useRef<HTMLImageElement>(null);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatus("loading")
    const file = event.target.files?.[0]
    
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(reader.result as string)
        event.target.value = '';
        setStatus("idle")
      }
      reader.readAsDataURL(file)
    } else {
      setStatus("idle")
    }
  }
  
  const handleTranslation = async () => {
    if (!image) return;
    const data = doTranslate();
    const translatedDataUrl = await drawTranslations(image, data);
    setImage(translatedDataUrl);
    setStatus("translated");
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
    <Button className="w-48 h-12 gap-2" disabled={status === "loading"}>
    <Upload size={18} />
    {status === "loading" ? "Loading..." : "Upload Image"}
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
    <Button className="size-12 cursor-pointer" onClick={() => handleTranslation()}><Languages size={18}/></Button>
    <Button className="size-12 cursor-pointer" disabled={status !== "translated"}><Save size={18}/></Button>
    </div>
    </main>
  )
}