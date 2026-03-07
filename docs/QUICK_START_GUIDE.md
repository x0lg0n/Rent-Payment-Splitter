# Quick Start Guide for Documentation

A concise reference for maintaining and updating SplitRent documentation.

---

## 📚 Documentation Files at a Glance

| File                  | Purpose                       | Update Frequency          |
| --------------------- | ----------------------------- | ------------------------- |
| `README.md`           | Main project overview         | As needed (major changes) |
| `docs/ROADMAP.md`     | Project timeline & milestones | Monthly                   |
| `docs/TODO.md`        | Task tracking & priorities    | Weekly                    |
| `docs/DEVELOPMENT.md` | Developer setup guide         | As needed                 |
| `CONTRIBUTING.md`     | Contribution guidelines       | Rarely                    |
| `CHANGELOG.md`        | Version history               | Per release               |

---

## 🎯 What to Update When

### After Completing a Feature

1. ✅ Check off completed items in `docs/TODO.md`
2. ✅ Add feature to "What's Built" section in README.md
3. ✅ Take new screenshots if UI changed
4. ✅ Update CHANGELOG.md with new version

### Starting New Work

1. ✅ Move tasks from "Planned" to "In Progress" in TODO.md
2. ✅ Update "Current Priorities" section
3. ✅ Create GitHub issue if needed

### Weekly (Recommended: Monday)

1. ✅ Review TODO.md progress
2. ✅ Update current priorities
3. ✅ Check for any outdated information

### Before Major Release

1. ✅ Record new demo video if major features added
2. ✅ Update all screenshots
3. ✅ Review ROADMAP.md timeline
4. ✅ Update CHANGELOG.md
5. ✅ Test all links in documentation

---

## 📸 Adding Screenshots

### Quick Process

```bash
# 1. Take screenshot (example: macOS)
Cmd+Shift+4

# 2. Save to correct location
docs/screenshots/dashboard.png

# 3. Update README.md path if needed
<img src="./docs/screenshots/dashboard.png" alt="Dashboard" />
```

### Best Practices

- Use high resolution (1920x1080 minimum)
- Show clean browser window
- Hide bookmarks bar
- Use consistent styling
- Add descriptive alt text

---

## 🎥 Adding Videos

### YouTube Method (Recommended)

```markdown
<!-- In README.md -->
<div align="center">
  <a href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID">
    <img src="https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg" width="640"/>
  </a>
</div>
```

### Local File Method

```markdown
<!-- Save video as docs/videos/demo.mp4 -->
<video controls width="640">
  <source src="./docs/videos/demo.mp4" type="video/mp4">
</video>
```

---

## ✏️ Common Text Updates

### Update "Currently Under Development"

Location: README.md line ~70

```markdown
## 🚧 Currently Under Development

We're actively working on these features:

### Escrow System (In Progress)

- 🔄 Soroban smart contract for escrow management
- 🔄 Create and manage rent-splitting escrows
```

### Update Current Priorities

Location: docs/TODO.md (near end)

```markdown
## 🎯 Current Priorities

### This Week

- [ ] Task 1
- [ ] Task 2

### This Month

- [ ] Goal 1
- [ ] Goal 2
```

---

## 🔗 Important Links to Maintain

Update these across all files when they change:

- Live demo URL
- Twitter/social media handles
- Discord invite link
- Email addresses in CODE_OF_CONDUCT.md and SECURITY.md

---

## 📝 Quick Template for Status Updates

When adding new "In Progress" sections:

```markdown
### Feature Name (Status Emoji)

- 🔄 Current task 1
- 🔄 Current task 2
- [ ] Next task
- [ ] Future task

**Timeline**: [Month - Month Year]
**Status**: 🔄 In Progress (X% complete)
```

**Status Emojis:**

- 🔄 In Progress
- ⏳ Planned/Blocked
- ✅ Complete
- ❌ On Hold

---

## 🎨 Formatting Conventions

### Headers

```markdown
## Phase Level (H2)

### Feature Category (H3)

#### Specific Feature (H4)
```

### Lists

```markdown
- ✅ Completed item
- 🔄 In progress item
- [ ] Todo item (checkbox)
```

### Code Blocks

````markdown
```bash
# For commands
pnpm dev
```

```typescript
// For code examples
const x = 1;
```
````

---

## 🚨 Common Mistakes to Avoid

❌ **Don't** leave placeholder text like `[your-email@example.com]`  
✅ **Do** replace with actual contact info

❌ **Don't** have broken image links  
✅ **Do** verify all image paths work

❌ **Don't** update roadmap without updating TODO  
✅ **Do** keep them synchronized

❌ **Don't** write walls of text  
✅ **Do** use bullet points and headers

❌ **Don't** forget mobile responsiveness  
✅ **Do** test on different screen sizes

---

## 📊 Health Check Questions

Ask yourself regularly:

1. **New Visitor Test**: Would someone understand the project in 30 seconds?
2. **Contributor Test**: Is it clear how to contribute?
3. **User Test**: Can users find what's built and what's coming?
4. **Developer Test**: Is setup process well documented?
5. **Media Test**: Are there good screenshots and demos?

---

## 🛠️ Useful Tools

### Writing & Editing

- **Grammarly**: Grammar checking
- **Hemingway App**: Readability improvement
- **Markdown Preview**: VS Code extensions

### Images

- **Skitch**: Annotations
- **GIMP**: Image editing (free)
- **Canva**: Graphics creation

### Videos

- **OBS Studio**: Screen recording (free)
- **Loom**: Quick screencasts
- **DaVinci Resolve**: Video editing (free)

---

## 📞 When to Ask for Help

Consider asking the community when:

- Unsure about documentation structure
- Need feedback on clarity
- Want to add major new sections
- Planning significant reorganization

---

## 🎯 Success Metrics

Good documentation has:

- ✅ Low bounce rate on GitHub
- ✅ Fewer basic questions in issues
- ✅ More quality PRs
- ✅ Positive community feedback
- ✅ Regular contributor engagement

---

**Remember**: Documentation is never "done" - it evolves with the project!

---

Last Updated: March 3, 2026
