// Content: NG tube. Generated from the prototype skill file; edit here or in the app.
SP.content.add({
 "id": "ngt",
 "kind": "procedure",
 "title": "NG tube",
 "source": "",
 "pass": null,
 "parts": [
  {
   "id": "ins",
   "title": "Inserting an NG tube",
   "maxOther": 3
  },
  {
   "id": "rem",
   "title": "Removing an NG tube",
   "maxOther": 2
  }
 ],
 "scenes": [
  {
   "id": "assess",
   "label": "Assess"
  },
  {
   "id": "plan",
   "label": "Plan"
  },
  {
   "id": "setup",
   "label": "Set up"
  },
  {
   "id": "pass",
   "label": "Pass the tube"
  },
  {
   "id": "secure",
   "label": "Secure and finish"
  },
  {
   "id": "evaldoc",
   "label": "Evaluate and document"
  },
  {
   "id": "r-assess",
   "label": "Removal: assess and plan"
  },
  {
   "id": "r-setup",
   "label": "Removal: set up"
  },
  {
   "id": "r-out",
   "label": "Removal: take it out"
  }
 ],
 "sections": [
  {
   "id": "i-assess",
   "part": "ins",
   "title": "Insertion: assessment",
   "scene": "assess",
   "steps": [
    {
     "id": "I1",
     "num": "1",
     "star": true,
     "cue": "Verify the order",
     "text": "Verify [provider's orders]"
    },
    {
     "id": "I2",
     "num": "2",
     "star": true,
     "cue": "Wash hands, gloves on",
     "text": "[Wash hands] and don [clean gloves]"
    },
    {
     "id": "I3",
     "num": "3",
     "star": true,
     "cue": "ID, LOC, gag, GI assessment",
     "text": "Introduce self and [identify patient]. Assess [LOC]. Ask patient to [cough and swallow]; assess for [gag reflex]. GI assessment: ask about [nausea and vomiting], auscultate [bowel sounds], inspect/palpate for [abdominal distention]"
    },
    {
     "id": "I4",
     "num": "4",
     "star": false,
     "cue": "Check mucosa, best nare",
     "text": "Assess integrity of [nasal & oral mucosa]. Assess for the nare with [greatest air flow]"
    },
    {
     "id": "I5",
     "num": "5",
     "star": true,
     "cue": "Gloves off, hand hygiene",
     "text": "[Remove gloves] and perform [hand hygiene]"
    }
   ]
  },
  {
   "id": "i-plan",
   "part": "ins",
   "title": "Insertion: planning",
   "scene": "plan",
   "steps": [
    {
     "id": "I6",
     "num": "6",
     "star": false,
     "cue": "Gather equipment",
     "text": "Gather equipment: [NG tube], water, [straw], towel, [lubricant], tissues, [tape], emesis basin, [flashlight], stethoscope, clean gloves, [50–60 mL] syringe. Prepare [suction] if patient is unresponsive or has difficulty swallowing"
    },
    {
     "id": "I7",
     "num": "7",
     "star": true,
     "cue": "Explain + hand signal",
     "text": "[Explain] the procedure and how the patient can assist while the tube is passed. Establish a [hand signal] for pausing"
    },
    {
     "id": "I8",
     "num": "8",
     "star": true,
     "cue": "SpO2 probe on",
     "text": "Apply [SpO2 probe] to monitor oxygen saturation"
    }
   ]
  },
  {
   "id": "i-prep",
   "part": "ins",
   "title": "Insertion: set up the patient",
   "scene": "setup",
   "steps": [
    {
     "id": "I9",
     "num": "9",
     "star": false,
     "cue": "Privacy",
     "text": "Provide [privacy]"
    },
    {
     "id": "I10",
     "num": "10",
     "star": false,
     "cue": "Raise the bed",
     "text": "Raise bed to a [comfortable working position] to prevent back strain"
    },
    {
     "id": "I11",
     "num": "11",
     "star": true,
     "cue": "Gloves (+ PPE if needed)",
     "text": "Don [clean gloves] (also [gown, eye shield, and mask] if needed)"
    },
    {
     "id": "I12",
     "num": "12",
     "star": true,
     "cue": "High-Fowler's, sniffing position",
     "text": "Position patient in [high-Fowler's] and hyperextend the neck as if in a [sniffing position]. Remove [dentures] if present"
    },
    {
     "id": "I13",
     "num": "13",
     "star": true,
     "cue": "Measure NEX + mark it",
     "text": "Obtain insertion measurement and [mark it] with a small strip of tape or indelible marker. How to measure: [NEX] ([nose to ear to xiphoid process])"
    },
    {
     "id": "I14",
     "num": "14",
     "star": false,
     "cue": "Drape, tissues, basin, split tape",
     "text": "Drape chest with [bath towel]; give [facial tissues and emesis basin]. Prepare tape with a [split tail] on one end"
    },
    {
     "id": "I15",
     "num": "15",
     "star": false,
     "cue": "Stand on dominant side",
     "text": "Stand on the [right side] of the bed if right-handed, [left side] if left-handed"
    },
    {
     "id": "I16",
     "num": "16",
     "star": false,
     "cue": "Curl tube to make it pliable",
     "text": "Open NG tube and curve [14–16 inches] of the end around your hand and release to make it [pliable]"
    }
   ]
  },
  {
   "id": "i-insert",
   "part": "ins",
   "title": "Insertion: pass the tube",
   "scene": "pass",
   "steps": [
    {
     "id": "I17",
     "num": "17",
     "star": true,
     "cue": "Lubricate 3–4 inches",
     "text": "Lubricate the tube with [water-soluble gel] over [3–4 inches] at the distal tip"
    },
    {
     "id": "I18",
     "num": "18",
     "star": false,
     "cue": "Insert back and down, don't force",
     "text": "With head hyperextended, insert into the nostril pointing the tip [backward and downward]. DO NOT [FORCE] the tube; re-lubricate or [rotate] if there is resistance"
    },
    {
     "id": "I19",
     "num": "19",
     "star": false,
     "cue": "Chin down, sip, advance on swallow",
     "text": "At the [N-E mark], have the patient lower the [chin to the chest], take a [sip of water] through the straw and swallow. Advance the tube [each time] the patient swallows"
    },
    {
     "id": "I20",
     "num": "20",
     "star": true,
     "cue": "STOP on signal or distress",
     "text": "[STOP] tube advancement if the patient gives the [pre-established signal]. Discontinue and raise the tube to the [first mark] if distress: [gasping, coughing, bluish skin color], or [inability to speak or hum]. Try again after patient relaxes"
    },
    {
     "id": "I21",
     "num": "21",
     "star": true,
     "cue": "Penlight check, lightly secure, x-ray",
     "text": "At the NEX mark, use a [penlight] to check the back of the throat so the tube is [not coiled]. [Lightly] secure tube to nose and have placement verified by [radiography] (per facility policy)"
    }
   ]
  },
  {
   "id": "i-secure",
   "part": "ins",
   "title": "Insertion: secure and finish",
   "scene": "secure",
   "steps": [
    {
     "id": "I22",
     "num": "22",
     "star": true,
     "cue": "X-ray confirms → fully secure, note mark",
     "text": "Once [radiography] shows the NGT in the stomach, [fully] secure tube to the [bridge of the nose] and note the [measurement] where the tube exits the nares"
    },
    {
     "id": "I23",
     "num": "23",
     "star": false,
     "cue": "Inconclusive → withdraw, call provider",
     "text": "If radiography is [inconclusive], [withdraw] the tube and consult the [provider]"
    },
    {
     "id": "I24",
     "num": "24",
     "star": false,
     "cue": "Suction or clamp",
     "text": "Connect tube to [suction] or [clamp it] while awaiting further orders"
    },
    {
     "id": "I25",
     "num": "25",
     "star": true,
     "cue": "Gloves off, hand hygiene",
     "text": "[Remove gloves] and perform [hand hygiene]"
    },
    {
     "id": "I26",
     "num": "26",
     "star": true,
     "cue": "HOB at least 30°",
     "text": "Position patient with a minimum head elevation of [30°]"
    },
    {
     "id": "I27",
     "num": "27",
     "star": false,
     "cue": "Remove equipment",
     "text": "Remove [equipment] from bedside"
    }
   ]
  },
  {
   "id": "i-eval",
   "part": "ins",
   "title": "Insertion: evaluate and document",
   "scene": "evaldoc",
   "steps": [
    {
     "id": "I28a",
     "num": "28a",
     "star": true,
     "cue": "Evaluate: no respiratory distress",
     "text": "Patient exhibits no evidence of [respiratory distress]"
    },
    {
     "id": "I28b",
     "num": "28b",
     "star": true,
     "cue": "Evaluate: can speak or hum",
     "text": "Patient can [speak or hum]"
    },
    {
     "id": "I28c",
     "num": "28c",
     "star": true,
     "cue": "Evaluate: lungs clear",
     "text": "[Lung sounds] are present and [clear bilaterally]"
    },
    {
     "id": "I28d",
     "num": "28d",
     "star": true,
     "cue": "Evaluate: nose OK",
     "text": "No excess [bleeding or pain] in the area of the [nasal mucosa]"
    },
    {
     "id": "I29a",
     "num": "29a",
     "star": true,
     "cue": "Document: tube type + exit mark",
     "text": "Document [type of tube] inserted and [measurement] where the tube exits the nare"
    },
    {
     "id": "I29b",
     "num": "29b",
     "star": true,
     "cue": "Document: reason + tolerance",
     "text": "Document [reason for insertion] and how the patient [tolerated] the procedure"
    },
    {
     "id": "I29c",
     "num": "29c",
     "star": true,
     "cue": "Document: placement method",
     "text": "Document the [method for determining placement]"
    },
    {
     "id": "I29d",
     "num": "29d",
     "star": true,
     "cue": "Document: suction type + amount",
     "text": "Document [type and amount of suction], if used for [stomach decompression]"
    },
    {
     "id": "I29e",
     "num": "29e",
     "star": true,
     "cue": "Document: initial output",
     "text": "Document [description and amount of initial output] if connected to suction"
    },
    {
     "id": "I30",
     "num": "30",
     "star": true,
     "cue": "Standard precautions",
     "text": "Followed [standard precautions] when handling the tube"
    }
   ]
  },
  {
   "id": "r-assess",
   "part": "rem",
   "title": "Removal: assess and plan",
   "scene": "r-assess",
   "steps": [
    {
     "id": "R1",
     "num": "1",
     "star": true,
     "cue": "Verify the order",
     "text": "Verify [provider's order]"
    },
    {
     "id": "R2",
     "num": "2",
     "star": true,
     "cue": "Hand hygiene, gloves on",
     "text": "Perform [hand hygiene] and don [clean gloves]"
    },
    {
     "id": "R3",
     "num": "3",
     "star": true,
     "cue": "ID, LOC, bowel sounds, abdomen",
     "text": "Introduce self and [identify patient]. Assess [LOC]. Auscultate [bowel sounds] and inspect/palpate abdomen for [distention]"
    },
    {
     "id": "R4",
     "num": "4",
     "star": true,
     "cue": "Gloves off, hand hygiene",
     "text": "[Remove gloves] and perform [hand hygiene]"
    },
    {
     "id": "R5",
     "num": "5",
     "star": false,
     "cue": "Gather equipment",
     "text": "Gather: [towel], [emesis basin or bag], facial tissue, [oral hygiene equipment], clean gloves, [50–60 mL catheter-tip] syringe"
    },
    {
     "id": "R6",
     "num": "6",
     "star": false,
     "cue": "Explain + teach",
     "text": "[Explain] the procedure and provide any necessary [patient education]"
    }
   ]
  },
  {
   "id": "r-prep",
   "part": "rem",
   "title": "Removal: set up",
   "scene": "r-setup",
   "steps": [
    {
     "id": "R7",
     "num": "7",
     "star": false,
     "cue": "Privacy",
     "text": "Provide [privacy]"
    },
    {
     "id": "R8",
     "num": "8",
     "star": false,
     "cue": "Raise the bed",
     "text": "Raise bed to a [comfortable working position] to prevent back strain"
    },
    {
     "id": "R9",
     "num": "9",
     "star": false,
     "cue": "Fowler's if alert, lateral if not",
     "text": "Position patient in [semi-Fowler's or high-Fowler's] if alert, and in a [lateral position] if not alert"
    },
    {
     "id": "R10",
     "num": "10",
     "star": false,
     "cue": "Drape, tissues, basin",
     "text": "Drape chest with [bath towel]; give [facial tissues and emesis basin]"
    },
    {
     "id": "R11",
     "num": "11",
     "star": true,
     "cue": "Gloves (+ mask/shield/gown)",
     "text": "Don [clean gloves], [face mask with eye shield & gown] if indicated"
    },
    {
     "id": "R12",
     "num": "12",
     "star": true,
     "cue": "Suction off, flush 20 water + 20 air",
     "text": "If connected to suction, [turn suction off]. Flush NGT with [20 mL] of sterile water followed by [20 mL] of air"
    },
    {
     "id": "R13",
     "num": "13",
     "star": true,
     "cue": "Clamp, plug or pinch",
     "text": "[Clamp, plug, or pinch] the tube"
    }
   ]
  },
  {
   "id": "r-remove",
   "part": "rem",
   "title": "Removal: take it out",
   "scene": "r-out",
   "steps": [
    {
     "id": "R14",
     "num": "14",
     "star": false,
     "cue": "Remove the tape",
     "text": "Gently remove the [tape] securing the tube to the nose"
    },
    {
     "id": "R15",
     "num": "15",
     "star": false,
     "cue": "Deep breath and hold",
     "text": "Instruct the patient to take a [deep breath and hold it] just before removal"
    },
    {
     "id": "R16",
     "num": "16",
     "star": true,
     "cue": "Pull gently but quickly",
     "text": "Remove the tube from the nose [gently but quickly]"
    },
    {
     "id": "R17",
     "num": "17",
     "star": true,
     "cue": "Wrap in towel/glove, discard",
     "text": "Enclose the tube within the [towel or glove] and discard in the [correct waste container] (or per facility policy)"
    },
    {
     "id": "R18",
     "num": "18",
     "star": false,
     "cue": "Measure + empty output",
     "text": "[Measure and empty] final output in the suction container"
    },
    {
     "id": "R19",
     "num": "19",
     "star": true,
     "cue": "Gloves off, wash hands",
     "text": "[Remove gloves] and [wash hands]"
    },
    {
     "id": "R20",
     "num": "20",
     "star": false,
     "cue": "Oral hygiene, clear nose",
     "text": "Offer [oral hygiene] and encourage the patient to [clear the nose] with tissues or cotton applicators"
    },
    {
     "id": "R21",
     "num": "21",
     "star": false,
     "cue": "Discard disposables",
     "text": "Discard all [disposable equipment]"
    }
   ]
  },
  {
   "id": "r-eval",
   "part": "rem",
   "title": "Removal: evaluate and document",
   "scene": "r-out",
   "steps": [
    {
     "id": "R22",
     "num": "22",
     "star": true,
     "cue": "Evaluate: N/V, airway, nose",
     "text": "Evaluate for: [N/V], [clear airway], [moist & intact nasal mucosa]"
    },
    {
     "id": "R23",
     "num": "23",
     "star": true,
     "cue": "Document removal",
     "text": "Document: [type of tube removed]; [appearance/volume of gastric output] if used for suction; [appearance of nose and nasopharynx]; and [response of patient]"
    }
   ]
  }
 ],
 "grading": {
  "anytime": [
   "I30",
   "I20"
  ],
  "before": [
   [
    "I2",
    "I3"
   ],
   [
    "I11",
    "I17"
   ],
   [
    "I3",
    "I5"
   ],
   [
    "I4",
    "I5"
   ],
   [
    "I7",
    "I18"
   ],
   [
    "I8",
    "I18"
   ],
   [
    "I12",
    "I18"
   ],
   [
    "I13",
    "I18"
   ],
   [
    "I17",
    "I18"
   ],
   [
    "I22",
    "I24"
   ],
   [
    "I25",
    "I29a"
   ],
   [
    "R2",
    "R3"
   ],
   [
    "R3",
    "R4"
   ],
   [
    "R11",
    "R12"
   ],
   [
    "R14",
    "R16"
   ],
   [
    "R15",
    "R16"
   ],
   [
    "R19",
    "R23"
   ]
  ],
  "strict": [
   [
    "I18",
    "I19",
    "I21",
    "I22"
   ],
   [
    "R12",
    "R13",
    "R16",
    "R17",
    "R19"
   ]
  ]
 },
 "synonyms": {
  "nex": [
   "nose ear xiphoid",
   "nose to ear to xiphoid",
   "nose earlobe xiphoid",
   "nose to earlobe to xiphoid"
  ],
  "ngt": [
   "ng",
   "ng tube",
   "nasogastric",
   "nasogastric tube",
   "tube"
  ],
  "radiography": [
   "xray",
   "x ray",
   "x-ray",
   "cxr",
   "kub",
   "radiograph"
  ],
  "nare": [
   "nostril",
   "nostrils",
   "nares",
   "nose"
  ],
  "head elevation": [
   "hob",
   "head of bed",
   "head of the bed"
  ],
  "spo2": [
   "pulse ox",
   "pulse oximeter",
   "o2 sat",
   "sat",
   "oxygen saturation",
   "pulse oximetry"
  ],
  "water-soluble": [
   "lube",
   "lubricant",
   "ky",
   "k y",
   "water soluble gel"
  ],
  "emesis basin": [
   "kidney basin",
   "basin",
   "emesis bag",
   "emesis"
  ],
  "split tail": [
   "chevron",
   "split tape",
   "split-tail tape",
   "split tail tape"
  ],
  "high-fowler's": [
   "high fowlers",
   "high fowler",
   "fowlers",
   "fowler"
  ],
  "sniffing position": [
   "sniff position",
   "hyperextend",
   "hyperextended",
   "head back",
   "neck back"
  ],
  "xiphoid": [
   "xiphoid process",
   "sternum tip"
  ]
 }
});
