---
title: "Homelab"
description: "My single-node blue team lab: the architecture, the hardware, and the six projects it exists to produce."
showDate: false
showAuthor: false
showReadingTime: false
showTableOfContents: true
showWordCount: false
---

A blue team lab on one repurposed workstation: a small corporate network, the tools that watch it, and an isolated segment for malware. I follow keraattin's [Blue Team Roadmap](https://github.com/keraattin/Blue-Team-Roadmap#phase-9-build-your-portfolio) because it maps out the work, which leaves my time for finding gaps, refreshing concepts and building up skills like Python. Every piece feeds a project below. The security stack will be Microsoft's. Sentinel and Defender XDR are what many SOCs run, and they line up with SC-200, which I study for after the CISSP.

## Build Status

{{< pipeline items="Lab foundation :: In progress :: Proxmox and OPNsense first, then the three segments and the corporate network | Microsoft security stack :: Planned :: Sentinel, Defender XDR and Entra, starting with SC-200 study after the CISSP | Portfolio projects :: Planned :: Six projects from the roadmap, plus vulnerability management, each ending in a writeup" >}}

I call the lab done when each project has a published writeup, not when every tool is installed.
{.callout}

## Hardware

{{< specs >}}

{{< spec role="Host" title="Proxmox Node" rows="CPU: AMD Ryzen 9 5900X, 12 cores | Board: Gigabyte B550 AORUS ELITE V2 | Memory: 32GB G.Skill DDR4-3200, non-ECC | Power: EVGA SuperNOVA G3 1000W" tags="Proxmox VE 9.2, ZFS, Virtualization" >}}
A workstation I already owned, repurposed instead of replaced with a used enterprise server. I am staying at 32GB on purpose: memory prices moved against me, and my next dollar does more in storage than in headroom. The roadmap asks for 16GB or more, so 32GB clears it as long as each project runs only what it needs.
{{< /spec >}}

{{< spec role="Storage" title="NVMe and Expansion" rows="Boot and VMs: 1TB Seagate FireCuda 530 NVMe | State: in service, near capacity | Next: second NVMe or 2TB SATA SSD" tags="ZFS, Capacity" >}}
Storage is still the next purchase, but it is less urgent now. With the SIEM in the cloud, the lab no longer needs room for a local one. Windows images and snapshots are what fill the disk. I am holding off on bulk hard drives and an HBA: slot count is the constraint, not budget.
{{< /spec >}}

{{< spec role="Network" title="Quad-Port Intel I350" rows="Vendor: NICGIGA | Ports: Four gigabit, plus the onboard NIC | State: planned" tags="Bridges, Segmentation" >}}
Separate ports let me split segments at the NIC instead of only in software, and keep the onboard NIC for management.
{{< /spec >}}

{{< spec role="Access" title="Out-of-Band Management" rows="Device: Sipeed NanoKVM-PCIe (Basic) | Function: Remote KVM over IP | State: planned" tags="Remote Console, Recovery" >}}
Console access that survives the host going dark. When I detonate malware on purpose, I want a way back in that does not depend on whatever I just broke.
{{< /spec >}}

{{< spec role="Power" title="1000VA LiFePO4 UPS" rows="Vendor: GoldenMate | Output: 600W, pure sine wave | State: planned" tags="NUT, Graceful Shutdown" >}}
Lithium iron phosphate instead of sealed lead acid, for the cycle life. It is sized to shut the host down cleanly through NUT, not to ride out an outage.
{{< /spec >}}

{{< spec role="Open" title="GPU and Case" rows="GPU: RTX 3080 10GB, possible swap to RTX 3060 12GB | Case: Fractal Meshify 2 or SilverStone CS380 V2" tags="Decisions Open" >}}
The GPU question is idle power draw against local model work. The case waits on the storage expansion, because drive bays decide it.
{{< /spec >}}

{{< /specs >}}

Deferred on purpose: bulk hard drives, an HBA, a motherboard swap, and a second node. If I add a refurbished rack server later, it joins as a storage node, not a replacement.

## Network

I use the roadmap's three segments and add a management segment of my own. OPNsense is the only path between them, and I build and verify the segmentation before anything malicious runs.

{{< network-diagram >}}

| Segment | Purpose | Uplink |
|---|---|---|
| Management | Hypervisor, remote console, backups. Never connected to the cloud tenant | Onboard NIC |
| VLAN 10, Corporate | The network I defend: a domain controller, Windows endpoints, a Linux workstation | Intel I350, outbound only to the Microsoft services it reports to |
| VLAN 20, SOC | Collection and scanning: the Windows event collector, the syslog forwarder, the Qualys appliance and DefectDojo | Intel I350 |
| VLAN 30, Malware | Untrusted samples and the tools I use to take them apart. Never connected to the cloud tenant | None |

The SIEM moves out of the lab. Corporate endpoints report straight to Defender, and OPNsense lets them reach only the Microsoft services they need. Windows event logs go to a collector in SOC and on to Sentinel. Suricata runs on OPNsense and sends its alerts to Sentinel over syslog.

Suricata only sees traffic that crosses the firewall, not traffic between hosts inside Corporate. Defender for Endpoint and Defender for Identity cover what happens on the hosts and the domain controller.

## What Runs Where

I keep the roadmap's projects and change the tools under them. OPNsense stands in for pfSense, since it was already running and does the same job. The security stack is Microsoft's: Sentinel in the Defender portal as the SIEM, and Defender XDR across endpoints, identity and email. Many SOCs run this stack, and it is the one SC-200 tests. None of it is running yet. The table is the plan.

| Segment | Tool | Role |
|---|---|---|
| All | Proxmox VE 9.2 with ZFS | Hypervisor, snapshots, and backups to the second disk |
| All | OPNsense | Routing, segmentation, rule enforcement, and Suricata for network detection |
| Corporate | Windows Server 2022 | Domain controller and Active Directory, with the Defender for Identity sensor and Entra Cloud Sync for hybrid identity |
| Corporate | Windows 10 and 11 | Endpoints onboarded to Defender for Endpoint, one of them also running Sysmon |
| Corporate | Ubuntu | Linux workstation, onboarded to Defender for Endpoint |
| SOC | Windows event collector | Windows Event Forwarding, shipped to Sentinel by the Azure Monitor Agent through Azure Arc |
| SOC | Syslog forwarder | A small Linux VM that sends OPNsense and Suricata logs to Sentinel through the Azure Monitor Agent |
| Cloud | Microsoft Sentinel | SIEM in the Defender portal: data collection rules, analytics rules, KQL hunting, workbooks, and Python notebooks and KQL jobs |
| Cloud | Microsoft Defender XDR | Defender for Endpoint (Plan 2), for Identity, and for Office 365 (Plan 2) with Exchange Online lab mailboxes, and one queue for incidents and cases |
| Cloud | Microsoft Entra ID | Identity for the tenant, with ID Protection watching sign-in risk |
| Cloud | Microsoft Purview | Audit and eDiscovery for investigations |
| Cloud | Security Copilot | Summarizing incidents and drafting KQL, always checked by hand |
| Malware | FLARE-VM | Windows malware analysis |
| Malware | REMnux | Linux malware analysis and network simulation |

Sysmon stays on one endpoint on purpose. It is a Microsoft Sysinternals tool, and running it beside Defender for Endpoint lets me compare two views of the same activity: the raw events most detection content and incident datasets expect, and the telemetry Defender records and correlates.

## The Six Projects

These six come straight from the roadmap, in the order they come off the lab. Each one ends in a writeup.

{{< projects keys="siem,atomic,phish,ir,intel,rules" >}}
| Project | What it proves | Uses |
|---|---|---|
| 1. SIEM deployment and dashboards | I can get Windows, Sysmon and network logs into one place and make them readable | Sentinel and Defender XDR, with Windows events, syslog and Suricata alerts collected through the Azure Monitor Agent |
| 2. Adversary emulation | I can run MITRE ATT&CK techniques on purpose, check what the SIEM saw, and write rules for what it missed | Atomic Red Team on a Corporate endpoint, Defender for Endpoint set to record instead of block, Sentinel |
| 3. Phishing analysis pipeline | I can take apart headers, URLs and attachments, and script the IOC extraction | Defender for Office 365 with lab mailboxes, REMnux for attachments, a small Python tool |
| 4. Incident response reports | I can write up an investigation the way a client would receive it: summary, timeline, IOCs, ATT&CK mapping, remediation | Retired HTB Sherlocks and CyberDefenders labs, FLARE-VM, and Defender XDR for incidents from my own lab |
| 5. Threat intelligence brief | I can turn one threat group's TTPs into detections I test myself | Public reporting, Defender threat analytics, indicators in Sentinel |
| 6. Detection rules in the open | I can write KQL detections, converted from Sigma where it fits, and YARA rules, test them here, and publish them on GitHub | Sentinel analytics rules, Defender custom detections, REMnux for YARA |
{{< /projects >}}

### One addition: vulnerability management

The roadmap does not cover vulnerability management, and it is the work I know best, so I add one project of my own. It needs no new target machines: two scanners look at the same Corporate hosts the SIEM watches.

| Function | Tool | Role |
|---|---|---|
| Scanning | Qualys Community Edition | One platform, two views of the same hosts: the network scanner appliance and the Cloud Agent. The free tier covers 16 internal IPs and 16 agents, well past what Corporate needs |
| Scanning | Defender Vulnerability Management | The same hosts again, through the Defender for Endpoint sensor, with no separate agent or appliance |
| Findings | DefectDojo | System of record: ownership, status, deduplication. Microsoft has no equivalent, so it stays |
| Prioritization | CISA KEV and FIRST EPSS | Rank by real-world exploitation, not CVSS alone |

The writeup compares the two scanners on the same hosts, then follows one finding to a verified fix. ServiceNow Vulnerability Response is on hold as the system of record. It replaces DefectDojo only after it passes a test on a free ServiceNow developer instance.

{{< vm-loop >}}

A finding is closed when a rescan proves it, not when a ticket says so.
{.callout}

## Resource Plan {.h-minor}

Only the machines in the lab count now. The SIEM and the Defender services run in the cloud. Everything except the malware VMs, powered on at once, would sit right at the 32GB cap, so each project still powers on its own machines and leaves the rest off.

{{< resource-plan cap="32" >}}
| Project | Runs | Planned memory |
|---|---|---|
| SIEM and dashboards | OPNsense, domain controller, two Windows endpoints, Ubuntu, the event collector, the syslog forwarder | About 24GB |
| Adversary emulation | OPNsense, domain controller, one Windows endpoint, the event collector | About 16GB |
| Phishing, IR reports, YARA | FLARE-VM or REMnux. The mailboxes and incidents live in the cloud | 4 to 8GB |
| Vulnerability management | OPNsense, the Corporate hosts, the Qualys scanner appliance, DefectDojo | About 26GB |
{{< /resource-plan >}}

The numbers are my own allowances. OPNsense with Suricata, the domain controller, each Windows endpoint and the event collector get 4GB each. Ubuntu and the syslog forwarder get 2GB each. The Qualys scanner appliance and DefectDojo get 4GB each; the appliance ships at 8GB but runs on as little as 2GB. FLARE-VM gets 8GB and REMnux 4GB.

## Operating Constraints {.h-minor}

{{< rules >}}
- I schedule projects instead of stacking them. Nothing runs that the current project does not need.
- No inbound port forwards. The lab is never reachable from the internet.
- The malware segment has no uplink, no shared folders and no shared clipboard, and every analysis VM reverts to a clean snapshot after use.
- The malware segment and the management network are never connected to the cloud tenant. Samples stay on hardware I own.
- I only run attack techniques against machines in this lab. The target sits in its own Defender for Endpoint device group with no automated response and attack surface reduction rules in audit, so Defender records the technique instead of stopping it.
- The cloud tenant holds lab users and test data only. Admin accounts use MFA and Conditional Access, a break-glass account stays sealed, and nothing runs as admin day to day.
- Phishing simulations go only to lab mailboxes.
- Each project collects only the log tables it needs, under a daily ingestion cap.
- Detections, workbooks, playbooks and collection rules live on GitHub as code, so the setup can be rebuilt from the repository.
- Screenshots and exports are captured before any access window ends.
- Qualys Community Edition keeps scan data for 90 days, so I export any scan worth writing up the week it runs.
- I do not publish addresses, hostnames, or topology specifics here. That is deliberate.
{{< /rules >}}


{{< wip title="Still cooking" >}}
I am building the lab and documenting it as it lands. Sanitized configs, Sysmon settings and detection rules go up on [GitHub](https://github.com/labwithchristian) alongside it.

The finished projects live in [Writeups]({{< ref "writeups" >}}).
{{< /wip >}}
