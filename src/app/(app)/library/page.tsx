"use client";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Book, FileText, UploadCloud, Search } from 'lucide-react';
import DocumentUploader from '../../../components/home/DocumentUploader';

const RESOURCES = [
  { id: 1, title: "Physics Class 10 Textbook.pdf", type: "PDF", date: "Today" },
  { id: 2, title: "Intro to React Notes.docx", type: "DOCX", date: "Yesterday" },
  { id: 3, title: "History of Rome.epub", type: "Book", date: "3 days ago" },
];

export default function LibraryPage() {
  const router = useRouter();
  return (
    <div className="max-w-6xl mx-auto p-8 pt-12 space-y-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-hexagon-text-primary mb-2">Library</h1>
        <p className="text-hexagon-text-secondary">Your grounded materials and saved resources.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
             <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-hexagon-text-secondary" />
             <input type="text" placeholder="Search your materials..." className="w-full bg-hexagon-surface border border-hexagon-border rounded-xl pl-12 pr-4 py-3 text-hexagon-text-primary outline-none focus:border-hexagon-accent/50 transition-colors" />
          </div>

          <div className="space-y-4">
            {RESOURCES.map((res, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={res.id} 
                className="bg-hexagon-surface border border-hexagon-border p-4 rounded-xl flex items-center justify-between hover:border-hexagon-accent/30 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-hexagon-text-primary font-medium">{res.title}</h4>
                    <p className="text-hexagon-text-secondary text-sm">{res.type} • {res.date}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/tutor?topic=${encodeURIComponent(res.title)}`);
                  }}
                  className="px-4 py-2 bg-background border border-hexagon-border rounded-lg text-sm hover:bg-white/10 hover:border-hexagon-accent/30 text-hexagon-text-primary transition-all"
                >
                  Review
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <DocumentUploader />
        </div>
      </div>
    </div>
  );
}
