"use client"

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function AIAssistantCard() {
  return (
    <motion.div 
      whileHover={{ y: -4 }} 
      className="card-enhanced group relative"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      
      <div className="flex items-start gap-4">
        <div className="icon-wrap-blue flex-shrink-0">
          <Zap className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">AI Interview Assistant</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get AI-powered suggestions to improve your interview performance.</p>
          
          {/* Action buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="hq-btn-primary px-3 py-1.5 text-xs">
              Get Suggestions
            </button>
            <button className="btn-secondary-blue text-xs py-1.5 px-3">
              Ask a Question
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AIAssistantCard
