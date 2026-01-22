export default function Footer() {
  return (
    <footer className="relative z-10 py-16 px-6 border-t border-border/20">
      <div className="max-w-7xl mx-auto">
        {/* Decorative Divider */}
        <div className="temple-divider mb-12">
          <svg className="w-8 h-8 text-primary" viewBox="0 0 32 32" fill="currentColor">
            <polygon points="16,4 4,28 28,28" fillOpacity="0.3" />
            <polygon points="16,8 8,24 24,24" fillOpacity="0.5" />
            <polygon points="16,12 12,20 20,20" fillOpacity="0.8" />
          </svg>
        </div>

        <div className="text-center space-y-6">
          {/* Logo/Title */}
          <h3 className="font-display text-2xl text-gold-gradient tracking-wider">
            देवालय
          </h3>
          <p className="font-body text-sm text-muted-foreground max-w-md mx-auto">
            Exploring the intersection of ancient wisdom, sacred geometry, 
            and scientific principles in Indian temple architecture.
          </p>

          {/* Credits */}
          <div className="pt-8 border-t border-border/10 mt-8">
            <p className="font-display text-sm text-foreground tracking-wider">
              Developed by <span className="text-primary">Sarthak Raj</span>
            </p>
            <p className="text-xs text-muted-foreground mt-2 tracking-wider">
              SOC-3 | IKS Project
            </p>
          </div>

          {/* Bottom Note */}
          <p className="text-xs text-muted-foreground/50 pt-4 tracking-wide">
            "सर्वं खल्विदं ब्रह्म" — All this is indeed Brahman
          </p>
        </div>
      </div>
    </footer>
  );
}
