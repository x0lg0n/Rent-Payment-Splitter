# Videos Directory

This directory contains video demos and tutorials for SplitRent.

## How to Add Videos

### Option 1: YouTube/Vimeo (Recommended)

1. Record your demo video
2. Upload to YouTube or Vimeo
3. Update the embed link in README.md

### Option 2: Local Video File

1. Save video file as `demo.mp4` in this directory
2. Use HTML5 video tag in documentation

## Recommended Videos

### Quick Demo (2-3 minutes)

- Connecting wallet
- Checking balance
- Making a payment
- Viewing transaction history
- Verifying on explorer

**File**: `quick-demo.mp4`

### Full Walkthrough (5-7 minutes)

- Project overview
- Complete feature demonstration
- Tips and best practices
- Common use cases

**File**: `full-walkthrough.mp4`

### Tutorial Series (Optional)

- `01-getting-started.mp4` - Setup and installation
- `02-wallet-setup.mp4` - Wallet configuration
- `03-making-payments.mp4` - Payment tutorial
- `04-escrow-guide.mp4` - Escrow tutorial (when ready)

## Recording Tools

### Screen Recording

- **macOS**: QuickTime Player (built-in), ScreenFlow, Camtasia
- **Windows**: OBS Studio (free), Camtasia, Bandicam
- **Linux**: OBS Studio, SimpleScreenRecorder, Kazam
- **Browser-based**: Loom, Screencastify

### Best Practices

- Resolution: 1920x1080 (Full HD) or higher
- Frame rate: 30fps minimum, 60fps preferred
- Audio: Clear narration if included
- Length: Keep it concise (under 10 minutes)
- Format: MP4 with H.264 codec

### Editing (Optional)

- DaVinci Resolve (free, professional)
- Shotcut (free, open source)
- iMovie (macOS, free)
- Adobe Premiere Pro
- Final Cut Pro

## Adding to Documentation

### YouTube Embed

```markdown
<div align="center">
  <a href="https://www.youtube.com/watch?v=VIDEO_ID">
    <img src="https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg" alt="Video thumbnail" width="640"/>
  </a>
</div>
```

### Local Video Embed

```markdown
<div align="center">
  <video controls width="640">
    <source src="./docs/videos/demo.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>
```

---

Last Updated: March 3, 2026
