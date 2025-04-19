"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Locale } from "@/lib/i18n/i18n-config"

const locations = [
  {
    id: "marrakech",
    name: "Marrakech",
    address: "Centre Bouzaher Oumaima, Lotissement Assanawbar, Marrakech 40000, Morocco",
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3738.262924336271!2d-7.998316311856417!3d31.638831868369593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafeff9ac12e8b3%3A0xfd80c0633adf54f4!2scentre%20bouzaher%20oumaima!5e0!3m2!1sen!2sma!4v1745085683972!5m2!1sen!2sma",
  },
]

export function LocationMap({
  open,
  onClose,
  lang,
  dictionary,
}: { open: boolean; onClose: () => void; lang: Locale; dictionary: any }) {
  const location = locations[0] // Currently only showing the first location

  // Set text direction based on language
  const textDirection = lang === "ar" ? "rtl" : "ltr"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl p-5" style={{ direction: textDirection }}>
        <DialogHeader className="pb-3">
          <DialogTitle className="text-xl">{dictionary.location.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{dictionary.location.marrakech}</h3>
            <p className="text-sm text-muted-foreground">{location.address}</p>
          </div>

          <div className="aspect-video w-full overflow-hidden rounded-lg border">
            <iframe
              src={location.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${dictionary.location.marrakech} ${dictionary.location.title}`}
              aria-label={`Map showing our location in ${dictionary.location.marrakech}`}
            ></iframe>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
