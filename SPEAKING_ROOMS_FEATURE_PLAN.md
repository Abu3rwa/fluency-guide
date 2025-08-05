# Live Peer Speaking Rooms – Implementation Plan

## 1. Feature Overview
Provide real-time 1-on-1 “speaking rooms” that match learners with peers (or tutors) for timed English conversation sessions.  
• Uses browser-native WebRTC for audio/video.  
• Integrates structured conversation prompts pulled from the existing lesson/task database to keep sessions goal-oriented.  
• Free tier: 5 min/day & random matching.  
• Premium tier: unlimited minutes, choose partner filters (level, interests, country) & session history.

## 2. Why Users Will Pay
1. Speaking practice is the scarcest, highest-value activity for English learners.  
2. Competitors charge \$10-\$30 / month for similar functionality.  
3. Our cost is virtually zero (peer-to-peer traffic, existing Firestore for signalling).

## 3. No-Cost Architecture
| Layer | Technology | Already in repo? | Cost |
|-------|------------|------------------|------|
| Signalling | Firebase Firestore / RTDB | ✅ | Free tier sufficient  |
| P2P Media | WebRTC (simple-peer) | ❌ (small npm dep) | Free |
| UI | React + MUI | ✅ | Free |
| Authentication | Firebase Auth | ✅ | Free |
| Conversation Prompts | lessonService / taskService | ✅ | Free |

No TURN server required for >90 % of connections; we can fall back to Google’s public STUN servers. (If TURN becomes necessary later we can explore open-source coturn.)

## 4. Data Model (Firestore)
```
rooms/{roomId}
  ├─ createdBy:  uid
  ├─ createdAt:  timestamp
  ├─ status:     "open" | "matched" | "finished"
  ├─ level:      "A1"-"C2"    // CEFR
  ├─ topics:     ["travel", "business"]
  ├─ expiresAt:  timestamp      // auto clean-up via TTL indexes
  └─ participants/{uid}
        ├─ joinedAt
        └─ disconnectReason
```

## 5. High-Level Flow
1. User opens **Speaking Rooms** page.
2. Client writes a new `rooms` doc with desired filters; sets status `open`.
3. Cloud Function / client listener matches two compatible open rooms → sets status `matched` & writes shared `roomId` to both users.
4. Clients establish WebRTC via Firestore signalling collection `rooms/{roomId}/signals`.
5. Timer component ends/freezes session after N minutes (5 for free, unlimited for premium).
6. After call, both sides rate the session → stored under `reviews` sub-collection.

## 6. Required Code Modules
- `src/services/speakingRoomService.js`  
  • createRoom, listenForMatch, sendSignal, cleanupRoom
- `src/contexts/SpeakingRoomContext.jsx` – wraps signalling & WebRTC hooks
- `src/hooks/useWebRTC.js` – thin wrapper around simple-peer
- Pages:
  • `SpeakingRoomLobbyPage.jsx` – pick filters / see queue
  • `SpeakingRoomCallPage.jsx` – actual call UI (video elements, timer, prompts sidebar)
  • Menu item registration in `components/Layout/menuItems.js`
- Cloud Functions (optional for server-side matching & TTL):
  • `matchRooms.ts`
  • `cleanupExpiredRooms.ts`

## 7. Monetisation Gate
```
const isPremium = userData?.subscription === "pro";
const maxDailyMinutes = isPremium ? Infinity : 5;
```
Insert checks in `SpeakingRoomContext` timer; show paywall dialog when exceeded.

## 8. Implementation Steps
1. **Set up signalling schema** in Firestore; write unit tests with Jest & Emulator.  
2. **Install simple-peer** (`npm i simple-peer`) and create `useWebRTC` hook.  
3. **SpeakingRoomService** – CRUD + listener helpers.  
4. **Lobby UI** – form with CEFR level (A1-C2), topics (chips), Start button, queue status.  
5. **Call UI** – two `video` tags, microphone/camera toggles, countdown timer, prompts drawer (reuse `taskService` to fetch random questions).  
6. **Premium gating** – fetch `userData.subscription`, enforce limits, add upsell modal linking to existing `/pricing` route.  
7. **Rating dialog** – 5-star + comment; stored for community quality.  
8. **Cleanup & analytics** – remove room docs after finish; emit study time event to `studentProgressService`.

## 9. Estimated Timeline (1 dev)
| Day | Task |
|-----|------|
| 1 | Firestore rules & data model |
| 2 | WebRTC hook & signalling prototype |
| 3 | Lobby UI + basic matching |
| 4 | Call UI (video, controls, timer) |
| 5 | Prompt integration & rating dialog |
| 6 | Premium gating & paywall |
| 7 | QA, cross-browser testing, deploy |

## 10. Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| NAT/Firewall blocks P2P | Add TURN later only for affected users; open-source coturn on free VPS |
| Inappropriate behaviour | Add “Report user” button; blocklist in Firestore |
| Abuse of free minutes | Daily cloud function resets `dailyMinutesUsed` counter |

## 11. Testing Checklist
- [ ] Unit tests for room matching logic (Jest + Emulator).  
- [ ] Cypress integration test: two browsers connect & exchange ICE candidates.  
- [ ] Manual test on mobile Safari / Chrome / Firefox.

## 12. Deployment
No new backend infra.  
`firebase deploy --only firestore,functions,hosting`  
Update version in `firestore.rules` & add TTL index for `expiresAt`.

## 13. Future Enhancements
1. Group rooms (max 4 participants).  
2. Tutor marketplace (take revenue share).  
3. AI transcription & feedback (powered by open-source Whisper.cpp in browser).  
4. Achievement badges for speaking streak.

---
© 2025 YourApp. All rights reserved.