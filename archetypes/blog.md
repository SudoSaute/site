---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: true
description: "The one-line argument. Shown under the title and in RSS readers."
tags: []
doodle: ""        # doodle key (layouts/partials/doodles/); blank shows the default
featured: false   # true pins it as the lead post instead of the newest
---

<!-- The first sentence becomes the lead quote on /blog/. Make it count. -->
