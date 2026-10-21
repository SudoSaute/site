---
title: "Writeups"
description: "Technical writeups: retired Hack The Box and TryHackMe boxes, LetsDefend and blue team labs, CTF postmortems, coursework and lab projects."
showDate: false
showAuthor: false
showReadingTime: false
showTableOfContents: false
showWordCount: false
---

The long form: how I worked a problem, what I decided and the evidence behind it. What lands here:

- Walkthroughs of retired Hack The Box and TryHackMe boxes
- LetsDefend and other blue team lab investigations
- CTF postmortems and lessons learned, after each event closes
- Coursework and projects from the [lab]({{< ref "homelab" >}})

Configs and detection rules go on [GitHub](https://github.com/SudoSaute).

## What's planned

The lab's four Microsoft projects, plus practice investigations and CTFs. Each project ends in at least one writeup here.

| Writeup | Covers | Source |
|---|---|---|
| Network segmentation | The lab's segments, the OPNsense rules between them, and why the malware segment has no way out | Lab |
| Endpoint and email defense | Attack surface reduction, attack and phishing simulations against lab endpoints and mailboxes, and what Defender caught and missed | Project 1 |
| Exposure and vulnerability management | Defender Vulnerability Management on the lab hosts, ranked by real-world exploitation, and one finding followed to a fix verified by rescan | Project 2 |
| SOC detections, hunting and response | KQL detections in Microsoft Sentinel and how they were tested, a hunt, and one Defender XDR incident written up as a client report | Project 3 |
| Purview data protection and compliance | Sensitivity labels and DLP on lab data, an Audit and eDiscovery investigation, and a Compliance Manager assessment | Project 4 |
| Incident response reports | Full investigations from retired boxes and blue team labs (Hack The Box, TryHackMe, LetsDefend): summary, timeline, IOCs, ATT&CK mapping, remediation | Practice |
| CTF writeups | Challenges from scored competitions: approach, tools and what I would do differently. Published after an event closes, and only where its rules allow | {{< ctf-link >}} |

{{< soon title="Nothing published yet" status="drafting" >}}
First up are incident response reports, since they need no lab build, then segmentation and the Defender and Sentinel projects as the tenant comes online.

In the meantime, the [Homelab]({{< ref "homelab" >}}) page tracks build status, and the [Blog]({{< ref "blog" >}}) will carry the shorter reasoning behind decisions.
{{< /soon >}}
