import { useState } from 'react'
import { startDemo } from '../sim/actions'
import wallpaper8k from '../assets/originos_wallpaper_8k.png'
import parktraceIcon from '../assets/parktrace_app_icon.png'

/**
 * Ultra-HD Native OriginOS 6 Home Screen for iQOO 15 Flagship Smartphone.
 *
 * Rendered with 8K background, vector typography, and high-DPI squircle app icons.
 */
export function OriginHomeScreen() {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="originos-root">
      {/* 8K Ultra-Crisp Wallpaper Background */}
      <img
        src={wallpaper8k}
        alt="OriginOS 6 8K Wallpaper"
        className="originos-bg"
        draggable={false}
      />

      {/* Specular OLED Glass Sheen */}
      <div className="originos-glass-sheen" aria-hidden="true" />

      {/* Top Status Bar */}
      <div className="originos-status-bar">
        <span className="originos-status-time">09:40</span>
        <div className="originos-status-icons">
          {/* Wi-Fi Icon */}
          <svg className="originos-status-svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 15a2 2 0 100 4 2 2 0 000-4z" />
            <path d="M5.5 11.5a6.5 6.5 0 019 0 .8.8 0 001.1-1.1 8 8 0 00-11.2 0 .8.8 0 001.1 1.1z" />
            <path d="M2.5 8.5a10.5 10.5 0 0115 0 .8.8 0 001.1-1.1 12 12 0 00-17.2 0 .8.8 0 001.1 1.1z" />
          </svg>
          {/* Solid Battery Capsule */}
          <div className="originos-battery">
            <div className="originos-battery-body">
              <div className="originos-battery-fill" />
            </div>
            <div className="originos-battery-cap" />
          </div>
        </div>
      </div>

      {/* Central Large Clock & Weather Widget */}
      <div className="originos-widget-clock">
        <div className="originos-clock-digits">09:40</div>
        <div className="originos-clock-meta">
          <span>Wed, Oct 15</span>
          <span className="originos-meta-dot">•</span>
          <span className="originos-weather-icon">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
              {/* Sun behind cloud */}
              <circle cx="15.5" cy="8.5" r="3.5" fill="#f59e0b" />
              {/* Cloud body */}
              <path
                d="M7 16a3.5 3.5 0 01-.5-6.96A5 5 0 0116.2 8.5 4 4 0 0119 14.5H7z"
                fill="#ffffff"
              />
              {/* Rain drops */}
              <path
                d="M8.5 17.5l-1.5 3M12.5 17.5l-1.5 3M16.5 17.5l-1.5 3"
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>24°C</span>
        </div>
      </div>

      {/* Home Screen App Grid (Row 1) */}
      <div className="originos-app-grid">
        {/* Clock App */}
        <div className="originos-app-item">
          <div className="originos-app-icon icon-clock">
            <svg viewBox="0 0 48 48" className="icon-svg">
              <circle cx="24" cy="24" r="18" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
              {/* Hour hand */}
              <line x1="24" y1="24" x2="16" y2="18" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
              {/* Minute hand */}
              <line x1="24" y1="24" x2="32" y2="16" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" />
              {/* Red second dot indicator */}
              <circle cx="34" cy="30" r="2.2" fill="#ef4444" />
              <circle cx="24" cy="24" r="2" fill="#1e293b" />
            </svg>
          </div>
          <span className="originos-app-label">Clock</span>
        </div>

        {/* Albums App */}
        <div className="originos-app-item">
          <div className="originos-app-icon icon-albums">
            <svg viewBox="0 0 48 48" className="icon-svg">
              <circle cx="32" cy="18" r="3.5" fill="#ffffff" />
              {/* Mountains */}
              <path
                d="M12 34l8-10 6 7 5-5 7 8H12z"
                fill="#ffffff"
              />
              <path
                d="M26 31l5-5 7 8h-12z"
                fill="rgba(255,255,255,0.7)"
              />
            </svg>
          </div>
          <span className="originos-app-label">Albums</span>
        </div>

        {/* Park Trace App - Primary Hero App */}
        <button
          type="button"
          className={`originos-app-item app-hero-parktrace ${hovered ? 'hovered' : ''}`}
          onClick={startDemo}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          title="Launch Park Trace on iQOO 15"
          aria-label="Launch Park Trace"
        >
          <div className="originos-app-icon icon-parktrace">
            <img src={parktraceIcon} alt="Park Trace" className="icon-img-asset" />
            <div className="icon-rim-glow" aria-hidden="true" />
          </div>
          <span className="originos-app-label hero-label">Park Trace</span>
          <span className="originos-badge-launch">Tap to Demo</span>
        </button>

        {/* Settings App */}
        <div className="originos-app-item">
          <div className="originos-app-icon icon-settings">
            <svg viewBox="0 0 48 48" className="icon-svg">
              <circle cx="24" cy="24" r="7" fill="none" stroke="#475569" strokeWidth="4" />
              {/* Gear teeth */}
              <g stroke="#475569" strokeWidth="4" strokeLinecap="round">
                <line x1="24" y1="9" x2="24" y2="13" />
                <line x1="24" y1="35" x2="24" y2="39" />
                <line x1="9" y1="24" x2="13" y2="24" />
                <line x1="35" y1="24" x2="39" y2="24" />
                <line x1="13.4" y1="13.4" x2="16.2" y2="16.2" />
                <line x1="31.8" y1="31.8" x2="34.6" y2="34.6" />
                <line x1="13.4" y1="34.6" x2="16.2" y2="31.8" />
                <line x1="31.8" y1="16.2" x2="34.6" y2="13.4" />
              </g>
            </svg>
          </div>
          <span className="originos-app-label">Settings</span>
        </div>
      </div>

      {/* Pagination Indicators */}
      <div className="originos-pagination">
        <span className="originos-page-dash" />
        <span className="originos-page-dot" />
        <span className="originos-page-dot" />
      </div>

      {/* Bottom Dock */}
      <div className="originos-dock">
        {/* Phone */}
        <div className="originos-app-item">
          <div className="originos-app-icon dock-phone">
            <svg viewBox="0 0 48 48" className="icon-svg">
              <path
                d="M16 14a2 2 0 012-2h3a2 2 0 012 1.6l.7 3.5a2 2 0 01-.6 1.9l-2.2 1.8a14 14 0 006.4 6.4l1.8-2.2a2 2 0 011.9-.6l3.5.7a2 2 0 011.6 2v3a2 2 0 01-2 2C20 35 13 28 13 16a2 2 0 013-2z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>

        {/* Messages / Jovi */}
        <div className="originos-app-item">
          <div className="originos-app-icon dock-messages">
            <svg viewBox="0 0 48 48" className="icon-svg">
              <path
                d="M14 16h20a3 3 0 013 3v12a3 3 0 01-3 3H20l-6 4v-4h-0a3 3 0 01-3-3V19a3 3 0 013-3z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>

        {/* Browser */}
        <div className="originos-app-item">
          <div className="originos-app-icon dock-browser">
            <svg viewBox="0 0 48 48" className="icon-svg">
              <circle cx="24" cy="24" r="10" fill="#ffffff" opacity="0.9" />
              <ellipse
                cx="24"
                cy="24"
                rx="16"
                ry="5"
                transform="rotate(-30 24 24)"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Camera */}
        <div className="originos-app-item">
          <div className="originos-app-icon dock-camera">
            <div className="camera-outer-lens">
              <div className="camera-inner-glass">
                <div className="camera-specular" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gesture Pill */}
      <div className="originos-gesture-pill" aria-hidden="true" />
    </div>
  )
}
