---
title: "Homelab"
description: "My single-node blue team lab: the architecture, the hardware, and the six projects it exists to produce."
showDate: false
showAuthor: false
showReadingTime: false
showTableOfContents: true
showWordCount: false
---

A blue team lab on one repurposed workstation: a small corporate network, the tools that watch it, and an isolated segment for malware. I follow keraattin's [Blue Team Roadmap](https://github.com/keraattin/Blue-Team-Roadmap#phase-9-build-your-portfolio) because it maps out the work, which leaves my time for finding gaps, refreshing concepts and building up skills like Python. Every piece feeds a project below.

## Build Status

{{< pipeline items="Lab foundation :: In progress :: Proxmox and OPNsense first, then the three segments and the corporate network | Portfolio projects :: Planned :: Six projects from the roadmap, plus vulnerability management, each ending in a writeup" >}}

I call the lab done when each project has a published writeup, not when every tool is installed.
{.callout}

## Hardware

{{< specs >}}

{{< spec role="Host" title="Proxmox Node" rows="CPU: AMD Ryzen 9 5900X, 12 cores | Board: Gigabyte B550 AORUS ELITE V2 | Memory: 32GB G.Skill DDR4-3200, non-ECC | Power: EVGA SuperNOVA G3 1000W" tags="Proxmox VE 9.2, ZFS, Virtualization" >}}
A workstation I already owned, repurposed instead of replaced with a used enterprise server. I am staying at 32GB on purpose: memory prices moved against me, and my next dollar does more in storage than in headroom. The roadmap asks for 16GB or more, so 32GB clears it as long as each project runs only what it needs.
{{< /spec >}}

{{< spec role="Storage" title="NVMe and Expansion" rows="Boot and VMs: 1TB Seagate FireCuda 530 NVMe | State: in service, near capacity | Next: second NVMe or 2TB SATA SSD" tags="ZFS, Capacity" >}}
The expansion comes first. Security Onion alone wants 200GB, and Windows images and snapshots add up fast. I am holding off on bulk hard drives and an HBA: slot count is the constraint, not budget.
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
| Management | Hypervisor, remote console, backups | Onboard NIC |
| VLAN 10, Corporate | The network I defend: a domain controller, Windows endpoints, a Linux workstation | Intel I350, outbound only |
| VLAN 20, SOC | The tools that watch it: SIEM, network monitoring, case management | Intel I350 |
| VLAN 30, Malware | Untrusted samples and the tools I use to take them apart | None |

The Corporate endpoints send their logs to the SIEM through a single allowed rule. Security Onion watches Corporate traffic from a mirrored port on the Corporate bridge, so it sees the network without being part of it.

## What Runs Where

I keep to the roadmap's stack, with two exceptions. OPNsense stands in for pfSense, since it was already running and does the same job. For the SIEM I run Elastic Security: its free tier includes detection with alerting, it runs entirely inside the lab, and it is a platform teams deploy in production.

| Segment | Tool | Role |
|---|---|---|
| All | Proxmox VE 9.2 with ZFS | Hypervisor, snapshots, and backups to the second disk |
| All | OPNsense | Routing, segmentation, rule enforcement |
| Corporate | Windows Server 2022 | Domain controller and Active Directory |
| Corporate | Windows 10 and 11 | Endpoints running Sysmon and Elastic Defend, with Elastic Agent shipping both |
| Corporate | Ubuntu | Linux workstation |
| SOC | Elastic Security | SIEM: Elasticsearch, Kibana and Fleet for collection, detection rules, alerts and dashboards |
| SOC | Security Onion | Network detection with Zeek and Suricata |
| SOC | TheHive | Case management for every investigation |
| Malware | FLARE-VM | Windows malware analysis |
| Malware | REMnux | Linux malware analysis and network simulation |

Sysmon and Elastic Defend do different jobs. Sysmon records process, network and file activity in the format most detection rules and incident datasets expect. Elastic Defend adds malware protection on top. Security Onion runs its own Elasticsearch internally, so I keep it to network monitoring and send endpoint logs to Elastic Security.

## The Six Projects

These six come straight from the roadmap, in the order they come off the lab. Each one ends in a writeup.

{{< projects keys="siem,atomic,phish,ir,intel,rules" >}}
| Project | What it proves | Uses |
|---|---|---|
| 1. SIEM deployment and dashboards | I can get Windows, Sysmon and network logs into one place and make them readable | Corporate, Elastic Security, Security Onion |
| 2. Adversary emulation | I can run MITRE ATT&CK techniques on purpose, check what the SIEM saw, and write rules for what it missed | Atomic Red Team on a Corporate endpoint, Elastic Security, Elastic Defend set to detect instead of block |
| 3. Phishing analysis pipeline | I can take apart headers, URLs and attachments, and script the IOC extraction | REMnux, a small Python tool |
| 4. Incident response reports | I can write up an investigation the way a client would receive it: summary, timeline, IOCs, ATT&CK mapping, remediation | Retired HTB Sherlocks and CyberDefenders labs, FLARE-VM, TheHive |
| 5. Threat intelligence brief | I can turn one threat group's TTPs into detections I test myself | Public reporting, Elastic Security |
| 6. Detection rules in the open | I can write Sigma and YARA rules, test them here, and submit them upstream | Elastic Security, REMnux |
{{< /projects >}}

### One addition: vulnerability management

The roadmap does not cover vulnerability management, and it is the work I know best, so I add one project of my own. It needs no new target machines: the scanner looks at the same Corporate hosts the SIEM watches.

| Function | Tool | Role |
|---|---|---|
| Scanning | Qualys Community Edition | One platform, two views of the same hosts: the network scanner appliance and the Cloud Agent. The free tier covers 16 internal IPs and 16 agents, well past what Corporate needs |
| Findings | DefectDojo | System of record: ownership, status, deduplication |
| Prioritization | CISA KEV and FIRST EPSS | Rank by real-world exploitation, not CVSS alone |

ServiceNow Vulnerability Response is on hold as the system of record. It replaces DefectDojo only after it passes a test on a free ServiceNow developer instance.

{{< vm-loop >}}

A finding is closed when a rescan proves it, not when a ticket says so.
{.callout}

## Resource Plan {.h-minor}

The whole stack does not fit in 32GB at once, and it does not have to. Each project powers on its own machines and leaves the rest off.

{{< resource-plan cap="32" >}}
| Project | Runs | Planned memory |
|---|---|---|
| SIEM and dashboards | OPNsense, domain controller, one Windows endpoint, Ubuntu, Elastic Security, Security Onion | About 27GB |
| Adversary emulation | OPNsense, domain controller, one Windows endpoint, Elastic Security | About 17GB |
| Phishing, IR reports, YARA | FLARE-VM or REMnux, TheHive when a case needs it | 8 to 20GB |
| Vulnerability management | OPNsense, the Corporate hosts, the Qualys scanner appliance, DefectDojo | About 19GB |
{{< /resource-plan >}}

The heaviest pieces set those numbers. Security Onion's evaluation mode asks for 8GB, and TheHive asks for about 4GB for each of its three services. I plan Elastic Security at 8GB for Elasticsearch, Kibana and Fleet Server on one VM, and the Qualys scanner appliance at 4GB. Those last two are my own allowances: Elastic publishes no lab-sized minimum, and the Qualys appliance ships at 8GB but runs on as little as 2GB.

## Operating Constraints {.h-minor}

{{< rules >}}
- I schedule projects instead of stacking them. Nothing runs that the current project does not need.
- No inbound port forwards. The lab is never reachable from the internet.
- The malware segment has no uplink, no shared folders and no shared clipboard, and every analysis VM reverts to a clean snapshot after use.
- I only run attack techniques against machines in this lab, and Elastic Defend stays in detect-only mode on the endpoint under test, so it records the technique instead of stopping it.
- Qualys Community Edition keeps scan data for 90 days, so I export any scan worth writing up the week it runs.
- I do not publish addresses, hostnames, or topology specifics here. That is deliberate.
{{< /rules >}}


{{< wip title="Still cooking" >}}
I am building the lab and documenting it as it lands. Sanitized configs, Sysmon settings and detection rules go up on [GitHub](https://github.com/labwithchristian) alongside it.

The finished projects live in [Writeups]({{< ref "writeups" >}}).
{{< /wip >}}
