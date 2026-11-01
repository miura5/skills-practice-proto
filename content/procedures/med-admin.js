// Content: Medication Administration. Generated from the prototype skill file; edit here or in the app.
SP.content.add({
 "id": "med-admin",
 "kind": "procedure",
 "title": "Medication Administration",
 "source": "",
 "pass": null,
 "parts": [
  {
   "id": "med",
   "title": "Medication administration",
   "maxOther": 8
  }
 ],
 "scenes": [
  {
   "id": "review",
   "label": "Review and assess"
  },
  {
   "id": "medroom",
   "label": "Med room"
  },
  {
   "id": "walkin",
   "label": "Walking in"
  },
  {
   "id": "give",
   "label": "Giving the meds"
  },
  {
   "id": "walkout",
   "label": "Walking out"
  }
 ],
 "sections": [
  {
   "id": "mar",
   "part": null,
   "title": "Verify the MAR",
   "scene": "review",
   "steps": [
    {
     "id": "1",
     "num": "1",
     "star": true,
     "cue": "Verify the MAR",
     "text": "Verify [accuracy and completeness] of the MAR; clarify any unclear or incomplete orders. MAR has patient's [name, DOB, MRN]; each med has [name, dose, route, time]; [allergies] are listed"
    }
   ]
  },
  {
   "id": "assess",
   "part": null,
   "title": "Assess / review",
   "scene": "review",
   "steps": [
    {
     "id": "2",
     "num": "2",
     "star": false,
     "cue": "Review the drug info",
     "text": "Review pertinent information related to the [medication] and [expected outcomes]"
    },
    {
     "id": "3",
     "num": "3",
     "star": false,
     "cue": "Medical + med history",
     "text": "Assess patient's [medical and medication history]"
    },
    {
     "id": "4",
     "num": "4",
     "star": true,
     "cue": "Verify allergies",
     "text": "Review and verify patient's [allergies]"
    },
    {
     "id": "5",
     "num": "5",
     "star": true,
     "cue": "Pre-assessments",
     "text": "Perform any necessary [pre-assessments], identify any [contraindications] and notify [provider] if present"
    },
    {
     "id": "6",
     "num": "6",
     "star": false,
     "cue": "Injection: assess body build",
     "text": "IM / subQ: assess patient's [body build], [muscle size], adequacy of [adipose tissue] and [weight]"
    },
    {
     "id": "7",
     "num": "7",
     "star": false,
     "cue": "Oral: assess swallowing",
     "text": "Oral: assess risk for [aspiration] and [swallowing ability]"
    }
   ]
  },
  {
   "id": "prep",
   "part": null,
   "title": "Prepare: all meds",
   "scene": "medroom",
   "steps": [
    {
     "id": "8",
     "num": "8",
     "star": true,
     "cue": "Hand hygiene",
     "text": "Perform [hand hygiene]"
    },
    {
     "id": "9",
     "num": "9",
     "star": false,
     "cue": "One patient, no distractions",
     "text": "Prepare medication for [1 patient at a time] in a [distraction-free] zone"
    },
    {
     "id": "10",
     "num": "10",
     "star": true,
     "cue": "Name the 6 rights",
     "text": "Identify the 6 Rights: [patient], [drug], [dose], [route], [time], [documentation]"
    },
    {
     "id": "11",
     "num": "11",
     "star": true,
     "cue": "Gather meds · 1st check",
     "text": "Gather all medications and check each label against the [MAR] ([1st] medication check)"
    },
    {
     "id": "12",
     "num": "12",
     "star": false,
     "cue": "Check expiration dates",
     "text": "Check [expiration date] on all medications; return outdated meds to [pharmacy]"
    }
   ]
  },
  {
   "id": "oralprep",
   "part": null,
   "title": "Prepare: oral",
   "scene": "medroom",
   "steps": [
    {
     "id": "13a",
     "num": "13a",
     "star": false,
     "cue": "Arrange med cups",
     "text": "Arrange [medication cups] in the preparation area"
    },
    {
     "id": "13b",
     "num": "13b",
     "star": true,
     "cue": "Select drug · 2nd check (oral)",
     "text": "Select correct oral drug; compare [name and dose] on label with MAR ([2nd] medication check for oral)"
    },
    {
     "id": "13c",
     "num": "13c",
     "star": true,
     "cue": "Check / calculate dose",
     "text": "[Check or calculate] drug dose as necessary"
    },
    {
     "id": "13d",
     "num": "13d",
     "star": false,
     "cue": "Into cup, still packaged",
     "text": "Place medication directly into cup [without removing] it from the package"
    }
   ]
  },
  {
   "id": "improp",
   "part": null,
   "title": "Prepare: IM from a vial",
   "scene": "medroom",
   "steps": [
    {
     "id": "14a",
     "num": "14a",
     "star": true,
     "cue": "Compare vial with MAR",
     "text": "Select vial and compare the [vial label] with the [MAR]"
    },
    {
     "id": "14b",
     "num": "14b",
     "star": true,
     "cue": "Calculate the dose",
     "text": "[Calculate] correct drug dose for administration"
    },
    {
     "id": "14c",
     "num": "14c",
     "star": true,
     "cue": "Cap off, alcohol, dry",
     "text": "Remove cap (if new vial); wipe rubber seal with [alcohol]; allow it to [dry]"
    },
    {
     "id": "14d",
     "num": "14d",
     "star": false,
     "cue": "Syringe + draw-up needle",
     "text": "Select correct [syringe size] and attach needle to draw up from vial"
    },
    {
     "id": "14e",
     "num": "14e",
     "star": false,
     "cue": "Draw up air = volume",
     "text": "Draw [air] into syringe [equal] to the volume of medication to be aspirated"
    },
    {
     "id": "14f",
     "num": "14f",
     "star": true,
     "cue": "Vial flat, center of seal",
     "text": "With vial on a [flat surface], insert device through the [center] of the rubber seal. Maintain [sterility] of needle and syringe"
    },
    {
     "id": "14g",
     "num": "14g",
     "star": false,
     "cue": "Inject the air",
     "text": "[Inject air] into vial (hold plunger firmly)"
    },
    {
     "id": "14h",
     "num": "14h",
     "star": false,
     "cue": "Invert, hold plunger",
     "text": "[Invert] vial and keep hold on [plunger] to counteract pressure"
    },
    {
     "id": "14i",
     "num": "14i",
     "star": true,
     "cue": "Tip below fluid, fill",
     "text": "Keep needle tip [below fluid level]; let air pressure fill syringe gradually; pull back on plunger if needed until [correct volume]"
    },
    {
     "id": "14j",
     "num": "14j",
     "star": false,
     "cue": "Into air space, eject air",
     "text": "Position needle into the [air space] of vial at desired volume; dislodge [air bubbles]; eject air at top of syringe"
    },
    {
     "id": "14k",
     "num": "14k",
     "star": false,
     "cue": "Remove from vial",
     "text": "[Remove needle] or needleless device from vial"
    },
    {
     "id": "14l",
     "num": "14l",
     "star": true,
     "cue": "Recheck volume, no bubbles",
     "text": "Hold syringe properly; ensure [correct volume] and [no air bubbles]; eject any air and [recheck volume]"
    },
    {
     "id": "14m",
     "num": "14m",
     "star": true,
     "cue": "Safety device → sharps",
     "text": "Activate [safety mechanism] or safely recap; remove needle and discard into [sharps container]"
    },
    {
     "id": "14n",
     "num": "14n",
     "star": true,
     "cue": "New needle, label · 2nd check (IM)",
     "text": "[Change needle] to correct gauge/length; [label] syringe (name, DOB, med, dose, route). Compare MAR with label and dose in syringe ([2nd] medication check for IM)"
    },
    {
     "id": "14o",
     "num": "14o",
     "star": false,
     "cue": "Label multidose vial",
     "text": "Label [multidose vial] properly ([date/time/initials])"
    }
   ]
  },
  {
   "id": "insulin",
   "part": null,
   "title": "Prepare: mixing insulin",
   "scene": "medroom",
   "steps": [
    {
     "id": "15a",
     "num": "15a",
     "star": true,
     "cue": "Pick insulins, compatibility",
     "text": "Select correct insulins to be mixed and consider [compatibility]"
    },
    {
     "id": "15b",
     "num": "15b",
     "star": true,
     "cue": "Smallest insulin syringe",
     "text": "Select appropriate insulin syringe ([smallest syringe] necessary for the number of units)"
    },
    {
     "id": "15c",
     "num": "15c",
     "star": true,
     "cue": "Verify units · 2nd check (subQ)",
     "text": "Verify insulins with MAR, noting how many [units] of each ([2nd] medication check for subQ)"
    },
    {
     "id": "15d",
     "num": "15d",
     "star": true,
     "cue": "Roll to resuspend",
     "text": "[Roll] bottle to resuspend insulin (if necessary)"
    },
    {
     "id": "15e",
     "num": "15e",
     "star": true,
     "cue": "Alcohol both seals",
     "text": "Wipe tops of [both] insulin vials with [alcohol]"
    },
    {
     "id": "15f",
     "num": "15f",
     "star": true,
     "cue": "Correct order",
     "text": "Prepare insulin in [correct order]: air into cloudy, air into clear, draw [clear before cloudy]"
    },
    {
     "id": "15g",
     "num": "15g",
     "star": true,
     "cue": "Air = intermediate dose",
     "text": "Draw up air equal to the [intermediate-acting] (cloudy) dose"
    },
    {
     "id": "15h",
     "num": "15h",
     "star": true,
     "cue": "Air into cloudy, no touching",
     "text": "Insert needle into [intermediate] vial; inject air and do [not let the needle tip touch] the solution"
    },
    {
     "id": "15i",
     "num": "15i",
     "star": true,
     "cue": "Out without aspirating",
     "text": "Remove needle from intermediate vial [without aspirating] medication"
    },
    {
     "id": "15j",
     "num": "15j",
     "star": true,
     "cue": "Air = rapid dose",
     "text": "Draw up air equal to the [rapid/short-acting] (clear) dose"
    },
    {
     "id": "15k",
     "num": "15k",
     "star": true,
     "cue": "Air into clear, draw clear",
     "text": "Insert needle into [rapid/short-acting] vial; inject air; invert and [aspirate] the correct dose"
    },
    {
     "id": "15l",
     "num": "15l",
     "star": true,
     "cue": "Verify clear dose · 2nd nurse",
     "text": "Verify the short-acting dose aspirated with [MAR and 2nd nurse]"
    },
    {
     "id": "15m",
     "num": "15m",
     "star": true,
     "cue": "Back into cloudy, draw cloudy",
     "text": "Insert needle back into intermediate vial; do [not inject] any insulin into the vial; invert and aspirate the intermediate dose"
    },
    {
     "id": "15n",
     "num": "15n",
     "star": true,
     "cue": "Check total dose",
     "text": "Withdraw needle and check the [total dose] in syringe"
    },
    {
     "id": "15o",
     "num": "15o",
     "star": true,
     "cue": "Verify combined · 2nd nurse",
     "text": "Verify [combined doses] with [MAR and 2nd nurse]"
    },
    {
     "id": "15p",
     "num": "15p",
     "star": true,
     "cue": "Recap safely",
     "text": "[Recap] needle safely to prepare for administration"
    },
    {
     "id": "15q",
     "num": "15q",
     "star": true,
     "cue": "Label insulin syringe",
     "text": "[Label] syringe with patient's name/DOB, [insulin names and doses], and route"
    }
   ]
  },
  {
   "id": "bedside",
   "part": null,
   "title": "At the bedside",
   "scene": "walkin",
   "steps": [
    {
     "id": "16",
     "num": "16",
     "star": true,
     "cue": "2 identifiers vs MAR",
     "text": "Identify patient using [2 identifiers]; compare with the [MAR]"
    },
    {
     "id": "17",
     "num": "17",
     "star": true,
     "cue": "Ask about allergies",
     "text": "[Ask] the patient about [allergies] and compare to the MAR"
    },
    {
     "id": "18",
     "num": "18",
     "star": true,
     "cue": "3rd check at bedside",
     "text": "Compare MAR with all medication labels [at bedside] ([3rd] medication check)"
    },
    {
     "id": "19",
     "num": "19",
     "star": false,
     "cue": "Teach: purpose, action, side effects",
     "text": "Explain [purpose], [action], possible [side effects]; allow patient to [ask questions]"
    },
    {
     "id": "20",
     "num": "20",
     "star": true,
     "cue": "Pre-admin assessment",
     "text": "Perform any necessary [pre-administration assessment] (not already done)"
    },
    {
     "id": "21",
     "num": "21",
     "star": false,
     "cue": "Warn: may burn",
     "text": "Inform patient injections may cause [burning]"
    },
    {
     "id": "22",
     "num": "22",
     "star": false,
     "cue": "Privacy",
     "text": "Provide [privacy]"
    },
    {
     "id": "23",
     "num": "23",
     "star": true,
     "cue": "Hand hygiene + gloves",
     "text": "Perform [hand hygiene] and don [clean gloves]"
    }
   ]
  },
  {
   "id": "oralgive",
   "part": null,
   "title": "Give: oral",
   "scene": "give",
   "steps": [
    {
     "id": "24a",
     "num": "24a",
     "star": true,
     "cue": "Upright, offer liquid",
     "text": "Assist patient to [upright position] and offer preferred [liquid]"
    },
    {
     "id": "24b",
     "num": "24b",
     "star": false,
     "cue": "Open packet just before",
     "text": "Remove tablet(s) from packet [just before use]"
    },
    {
     "id": "24c",
     "num": "24c",
     "star": false,
     "cue": "Patient holds cup; no chewing",
     "text": "Let patient hold cup or tablets, or place on top of tongue; caution against [chewing]"
    },
    {
     "id": "24d",
     "num": "24d",
     "star": true,
     "cue": "Stay until all taken",
     "text": "[Stay] and ensure patient [took all] medication"
    }
   ]
  },
  {
   "id": "imgive",
   "part": null,
   "title": "Give: IM",
   "scene": "give",
   "steps": [
    {
     "id": "25a",
     "num": "25a",
     "star": false,
     "cue": "Drape",
     "text": "Keep [sheet] over body parts not requiring exposure"
    },
    {
     "id": "25b",
     "num": "25b",
     "star": true,
     "cue": "Select + palpate site",
     "text": "Select site; note integrity and size of muscle; [palpate] and avoid [tenderness or hardness]; [rotate] site"
    },
    {
     "id": "25c",
     "num": "25c",
     "star": true,
     "cue": "Name all 3 IM sites + landmarks",
     "text": "Verbalize all IM sites: [Deltoid] 1–2 in below the [acromion process] · [Vastus lateralis] middle third between [greater trochanter] and [lateral femoral condyle] · [Ventrogluteal] opposite hand, palm on [greater trochanter], index finger on [anterior-superior iliac spine], middle finger toward [iliac crest], inject in center of the V"
    },
    {
     "id": "25d",
     "num": "25d",
     "star": false,
     "cue": "Comfortable position",
     "text": "Assist patient to a [comfortable position]"
    },
    {
     "id": "25e",
     "num": "25e",
     "star": false,
     "cue": "Relocate landmarks",
     "text": "[Relocate site] using anatomical landmarks"
    },
    {
     "id": "25f",
     "num": "25f",
     "star": true,
     "cue": "Alcohol the site",
     "text": "Cleanse site with [alcohol swab]"
    },
    {
     "id": "25g",
     "num": "25g",
     "star": false,
     "cue": "Gauze in nondominant, uncap",
     "text": "Hold [gauze] in nondominant hand and remove needle cap"
    },
    {
     "id": "25h",
     "num": "25h",
     "star": false,
     "cue": "Hold syringe properly",
     "text": "Hold syringe properly in [dominant] hand"
    },
    {
     "id": "25i",
     "num": "25i",
     "star": true,
     "cue": "Z-track, 90°",
     "text": "[Z-track]: pull skin down or laterally [1–1½ inches]; insert needle at [90 degrees] (small muscle: grasp the muscle)"
    },
    {
     "id": "25j",
     "num": "25j",
     "star": true,
     "cue": "Stabilize barrel",
     "text": "[Stabilize] end of syringe barrel; move dominant hand to plunger; avoid moving plunger"
    },
    {
     "id": "25k",
     "num": "25k",
     "star": true,
     "cue": "Aspirate 5–10 sec, inject",
     "text": "Pull back on plunger [5–10 seconds]; if no blood, slowly inject. Do [NOT aspirate] for immunizations"
    },
    {
     "id": "25l",
     "num": "25l",
     "star": false,
     "cue": "Wait 10 sec, withdraw",
     "text": "Wait [10 seconds]; withdraw needle; [release skin]; gauze over site"
    },
    {
     "id": "25m",
     "num": "25m",
     "star": false,
     "cue": "Pressure, no massage",
     "text": "Apply [pressure]; do [not massage]; band-aid if needed"
    },
    {
     "id": "25n",
     "num": "25n",
     "star": true,
     "cue": "Safety cap → sharps",
     "text": "Deploy [safety cap] immediately and place in [sharps container]"
    },
    {
     "id": "25o",
     "num": "25o",
     "star": false,
     "cue": "Return to comfort",
     "text": "Help patient return to [comfortable position]"
    }
   ]
  },
  {
   "id": "sqgive",
   "part": null,
   "title": "Give: subcutaneous",
   "scene": "give",
   "steps": [
    {
     "id": "26a",
     "num": "26a",
     "star": false,
     "cue": "Drape",
     "text": "Keep [sheet] over body parts not requiring exposure"
    },
    {
     "id": "26b",
     "num": "26b",
     "star": false,
     "cue": "Comfortable position",
     "text": "Assist patient to a [comfortable position]"
    },
    {
     "id": "26c",
     "num": "26c",
     "star": true,
     "cue": "Name subQ sites",
     "text": "Verbalize subQ sites: [abdomen or thigh] for insulin or heparin; [abdomen only] for LMWH"
    },
    {
     "id": "26d",
     "num": "26d",
     "star": true,
     "cue": "Select, inspect, rotate",
     "text": "Select site and [inspect skin]; avoid [masses or tenderness]; [rotate] sites"
    },
    {
     "id": "26e",
     "num": "26e",
     "star": true,
     "cue": "Relax, cleanse",
     "text": "Have patient [relax]; cleanse site with [antiseptic swab]"
    },
    {
     "id": "26f",
     "num": "26f",
     "star": false,
     "cue": "Gauze in nondominant, uncap",
     "text": "Hold [gauze] in nondominant hand and remove needle cap"
    },
    {
     "id": "26g",
     "num": "26g",
     "star": false,
     "cue": "Hold syringe properly",
     "text": "Hold syringe properly in [dominant] hand"
    },
    {
     "id": "26h",
     "num": "26h",
     "star": true,
     "cue": "Pinch skinfold",
     "text": "[Pinch skinfold] at site (if necessary)"
    },
    {
     "id": "26i",
     "num": "26i",
     "star": true,
     "cue": "45°, quickly, release",
     "text": "Inject needle at [45 degrees], [quickly]; [release skin] if pinched"
    },
    {
     "id": "26j",
     "num": "26j",
     "star": true,
     "cue": "Slow inject, wait 10 sec",
     "text": "[Slowly] inject, wait [10 seconds], withdraw, gauze over site"
    },
    {
     "id": "26k",
     "num": "26k",
     "star": false,
     "cue": "No massage",
     "text": "Do [not massage]; band-aid if necessary"
    },
    {
     "id": "26l",
     "num": "26l",
     "star": true,
     "cue": "Safety device → sharps",
     "text": "Deploy [safety device] immediately; discard in [sharps container]"
    },
    {
     "id": "26m",
     "num": "26m",
     "star": false,
     "cue": "Return to comfort",
     "text": "Help patient return to [comfortable position]"
    }
   ]
  },
  {
   "id": "post",
   "part": null,
   "title": "After administration",
   "scene": "walkout",
   "steps": [
    {
     "id": "27",
     "num": "27",
     "star": true,
     "cue": "Sharps + trash",
     "text": "All needles and syringes into puncture- and leak-proof [sharps container]; other supplies in [trash]"
    },
    {
     "id": "28",
     "num": "28",
     "star": true,
     "cue": "Gloves off, hand hygiene",
     "text": "[Remove gloves] and perform [hand hygiene]"
    },
    {
     "id": "29",
     "num": "29",
     "star": true,
     "cue": "Return to evaluate",
     "text": "[Return] within appropriate time to [evaluate response] / adverse reaction"
    },
    {
     "id": "30",
     "num": "30",
     "star": true,
     "cue": "Document immediately",
     "text": "[Document] on MAR [immediately after] administration; include [initials and signature]"
    },
    {
     "id": "31",
     "num": "31",
     "star": true,
     "cue": "Report adverse/withheld",
     "text": "Report [adverse effects] and any [withheld medications] to [charge nurse or HCP]"
    },
    {
     "id": "32",
     "num": "32",
     "star": true,
     "cue": "No contamination",
     "text": "Did [not contaminate] any needle during preparation or before administration"
    }
   ]
  }
 ],
 "grading": {
  "loose": {
   "9": {
    "1 patient at a time": [
     "one patient",
     "single patient",
     "one at a time",
     "1 patient"
    ],
    "distraction-free": [
     "no distraction",
     "no distractions",
     "without distraction",
     "without distractions",
     "free of distraction",
     "quiet",
     "no interruptions"
    ]
   },
   "11": {
    "1st": null
   },
   "13b": {
    "2nd": null
   },
   "14n": {
    "2nd": null
   },
   "15c": {
    "2nd": null
   },
   "18": {
    "3rd": null
   },
   "25n": {
    "safety cap": [
     "safety mechanism",
     "safety device",
     "safety feature",
     "safety"
    ]
   },
   "26l": {
    "safety device": [
     "safety mechanism",
     "safety cap",
     "safety feature",
     "safety"
    ]
   },
   "30": {
    "immediately after": [
     "immediately",
     "right after",
     "right away",
     "right when"
    ]
   }
  },
  "require": {
   "11": {
    "1st check against the MAR": [
     "1st",
     "check",
     "compare",
     "mar"
    ]
   },
   "13b": {
    "2nd check": [
     "2nd",
     "check",
     "compare",
     "mar"
    ]
   },
   "14n": {
    "2nd check": [
     "2nd",
     "check",
     "compare",
     "mar"
    ]
   },
   "15c": {
    "2nd check": [
     "2nd",
     "check",
     "compare",
     "mar"
    ]
   },
   "18": {
    "3rd check": [
     "3rd",
     "check",
     "compare",
     "mar",
     "label"
    ]
   },
   "23": {
    "hand hygiene": [
     "hand hygiene"
    ],
    "clean gloves": [
     "gloves"
    ]
   },
   "25i": {
    "Z-track 1–1½ in": [
     "z track"
    ],
    "90°": [
     "90"
    ]
   },
   "26i": {
    "45°": [
     "45"
    ]
   },
   "28": {
    "remove gloves": [
     "remove gloves"
    ],
    "hand hygiene": [
     "hand hygiene"
    ]
   }
  },
  "anytime": [
   "10",
   "25c"
  ],
  "before": [
   [
    "8",
    "11"
   ],
   [
    "8",
    "13b"
   ],
   [
    "8",
    "14a"
   ],
   [
    "8",
    "15a"
   ],
   [
    "11",
    "13b"
   ],
   [
    "11",
    "14n"
   ],
   [
    "11",
    "15c"
   ],
   [
    "13b",
    "18"
   ],
   [
    "14n",
    "18"
   ],
   [
    "15c",
    "18"
   ],
   [
    "16",
    "24b"
   ],
   [
    "16",
    "25i"
   ],
   [
    "16",
    "26i"
   ],
   [
    "17",
    "24b"
   ],
   [
    "17",
    "25i"
   ],
   [
    "17",
    "26i"
   ],
   [
    "18",
    "24b"
   ],
   [
    "18",
    "25i"
   ],
   [
    "18",
    "26i"
   ],
   [
    "23",
    "24b"
   ],
   [
    "23",
    "25f"
   ],
   [
    "23",
    "26e"
   ],
   [
    "25n",
    "28"
   ],
   [
    "26l",
    "28"
   ],
   [
    "27",
    "28"
   ],
   [
    "28",
    "30"
   ]
  ],
  "strict": [
   [
    "14e",
    "14f",
    "14g",
    "14h",
    "14i",
    "14j",
    "14k",
    "14l",
    "14m",
    "14n"
   ],
   [
    "15g",
    "15h",
    "15i",
    "15j",
    "15k",
    "15l",
    "15m",
    "15n",
    "15o",
    "15p",
    "15q"
   ],
   [
    "25i",
    "25j",
    "25k",
    "25l",
    "25m",
    "25n"
   ],
   [
    "26h",
    "26i",
    "26j",
    "26k",
    "26l"
   ]
  ]
 },
 "synonyms": {
  "antiseptic": [
   "alcohol",
   "alcohol swab",
   "alcohol pad",
   "alcohol prep",
   "chlorhexidine"
  ],
  "cleanse": [
   "wipe",
   "clean",
   "scrub",
   "swab",
   "prep"
  ],
  "medication": [
   "med",
   "meds",
   "medications",
   "medicine",
   "medicines",
   "drug",
   "drugs"
  ],
  "mar": [
   "emar",
   "medication administration record",
   "med administration record"
  ],
  "z track": [
   "ztrack",
   "z tracking",
   "zed track"
  ],
  "sharps": [
   "sharps container",
   "sharps box",
   "sharps bin",
   "needle box"
  ],
  "subq": [
   "subcut",
   "subcutaneous",
   "sub q",
   "sq"
  ],
  "im": [
   "intramuscular"
  ],
  "allergies": [
   "allergy",
   "allergic",
   "nkda"
  ],
  "expiration": [
   "expiry",
   "expired",
   "exp date",
   "expiration date",
   "expiration dates"
  ],
  "aspirate": [
   "pull back",
   "draw back",
   "aspiration"
  ],
  "privacy": [
   "curtain",
   "close the curtain",
   "close curtain",
   "close the door"
  ],
  "document": [
   "chart",
   "charting",
   "documentation",
   "sign the mar"
  ],
  "6 rights": [
   "six rights",
   "rights",
   "5 rights",
   "five rights"
  ],
  "cloudy": [
   "nph",
   "intermediate"
  ],
  "clear": [
   "regular",
   "rapid",
   "short acting",
   "rapid acting"
  ],
  "pinch skinfold": [
   "pinch skin",
   "pinch up skin",
   "pinch up a skinfold",
   "bunch up skin",
   "pinch a skinfold",
   "pinch skin fold"
  ],
  "drape": [
   "sheet",
   "cover patient",
   "cover the patient"
  ],
  "pre assessment": [
   "preassessment",
   "pre assess",
   "pre assessments",
   "pre administration assessment",
   "vitals"
  ],
  "evaluate": [
   "reassess",
   "re assess",
   "follow up",
   "check back"
  ]
 }
});
