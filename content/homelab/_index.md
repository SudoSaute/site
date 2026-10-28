---
title: "Homelab"
description: "The Microsoft security lab I'm building: a small corporate network on hardware I own, to be defended with Defender XDR, watched with Microsoft Sentinel, and governed with Purview."
showDate: false
showAuthor: false
showReadingTime: false
showTableOfContents: true
showWordCount: false
---

A Microsoft security lab on one repurposed workstation, being built in the open. On-prem, it will be a small corporate network: a domain controller, Windows and Linux endpoints, and a firewall. In the cloud, a Microsoft 365 E5 and Azure tenant. Once the tenant is live, Defender XDR will protect the endpoints, mailboxes and domain controller, Microsoft Sentinel will be the SOC's SIEM, and Purview will cover data protection and compliance.

Security leads the lab, with the SOC and compliance close behind. Identity runs underneath all of it: it's where most of my production experience is, so it's the foundation, not the headline.

## Build Status

{{< pipeline items="Lab foundation :: In progress :: Proxmox and OPNsense, then the corporate network: a domain controller and Windows and Ubuntu endpoints | Microsoft tenant :: Next :: Microsoft 365 E5 and Microsoft Sentinel, with Entra ID set up first and the Azure side written in Terraform | Four projects :: Planned :: Two security, one SOC, one compliance, each ending in a writeup" >}}

The lab is done when each project has a published writeup, not when every tool is installed.
{.callout}

## The Microsoft Stack

| Product | What it does in the lab |
|---|---|
| Microsoft Defender XDR | Defender for Endpoint on the Windows and Ubuntu machines, Defender for Office 365 on lab mailboxes, Defender for Identity on the domain controller, Defender Vulnerability Management, and one incident queue across all of them |
| Microsoft Sentinel | The SOC's SIEM, in the Defender portal. Windows events and firewall logs come in through the Azure Monitor Agent, and detections and hunts are written in KQL |
| Microsoft Purview | Sensitivity labels, DLP and Insider Risk Management on lab data, Audit and eDiscovery for investigations, and Compliance Manager assessments against the frameworks I've worked with |
| Microsoft Entra ID | The foundation: identity for the tenant, synced from the lab domain controller, with Conditional Access, ID Protection and PIM |

Everything else is supporting cast: Proxmox for the virtual machines, OPNsense for the firewall and Suricata, and Sysmon on one endpoint so I can compare raw events with what Defender records.

## The Projects

{{< projects keys="defend,exposure,soc,purview" >}}
| Project | What it proves | Uses |
|---|---|---|
| 1. Endpoint and email defense | I can harden endpoints and mailboxes, run real attack and phishing simulations against them, and show what Defender caught and what it missed | Defender for Endpoint, attack surface reduction rules, Defender for Office 365, Attack simulation training, Defender for Identity |
| 2. Exposure and vulnerability management | I can find what's exposed, rank it by real-world exploitation, and prove the fix with a rescan | Defender Vulnerability Management, Secure Score, CISA KEV, ServiceNow |
| 3. SOC detections, hunting and response | I can get logs into Sentinel, write and test KQL detections, hunt, and work an incident end to end into a client-style report | Sentinel, Defender XDR incidents, KQL, Atomic Red Team |
| 4. Purview data protection and compliance | I can classify and protect sensitive data, investigate with Audit and eDiscovery, and map controls in Compliance Manager | Sensitivity labels, DLP, Insider Risk Management, Audit, eDiscovery, Compliance Manager |
{{< /projects >}}

Entra ID sits under all four instead of being one of them. It's the tenant's identity, synced from the lab domain controller, with Conditional Access, ID Protection and PIM. It's the part I know best from production, so it gets built first and every project leans on it.

## Under the Hood {.h-minor}

| Part | What it is |
|---|---|
| Host | AMD Ryzen 9 5900X, 32GB DDR4, 1TB NVMe, running Proxmox VE with ZFS |
| Network | OPNsense with four segments: management, corporate, SOC, and an isolated malware segment |
| Cloud | Microsoft 365 E5 and Azure, with the Azure side defined in Terraform |
| Next purchase | Storage: a second NVMe or a 2TB SATA SSD |

{{< network-diagram >}}

## Operating Constraints {.h-minor}

{{< rules >}}
- No inbound port forwards. The lab is never reachable from the internet.
- The malware segment and the management network never touch the cloud tenant.
- I only run attack techniques against machines in this lab, in a Defender device group set to record instead of block.
- The tenant holds lab users and test data only. Admin accounts use MFA and Conditional Access, and a break-glass account stays sealed.
- Detections, policies and collection rules live on GitHub as code, so the setup can be rebuilt from the repository.
{{< /rules >}}

{{< wip title="Still cooking" >}}
I'm building the lab and documenting it as it lands. Sanitized configs, policy exports and detection rules go up on [GitHub](https://github.com/SudoSaute) alongside it.

The finished projects live in [Writeups]({{< ref "writeups" >}}).
{{< /wip >}}
