var indexList=[
  {
    "displayName": "International Corpus of English",
    "index": "icecontext",
    "type": "iceraw",
    "dataPort":"ice",
    "containContext": true,
    "aggregations": [
      {
        "fieldName": "areaCode",
        "displayName": "Country:",
        "displayEmpty": "All countries",
        "multiValued": true,
        "inSearch": true
      },
      {
        "fieldName": "region",
        "displayName": "Region:",
        "displayEmpty": "All regions",
        "multiValued": false,
        "inSearch": false
      },
      {
        "fieldName": "textType",
        "displayName": "Text type:",
        "displayEmpty": "All types",
        "multiValued": false,
        "inSearch": false
      }
    ],
    "cellsInRow": 3,
    "includeLemma": false,
    "wordClasses":[]
  },
  {
    "displayName": "British National Corpus",
    "index": "bnces",
    "type": "bncall",
    "dataPort":"bnc",
    "containContext": false,
    "aggregations": [
      {
        "fieldName": "domain",
        "displayName": "Domain:",
        "displayEmpty": "All domains",
        "multiValued": true,
        "inSearch": true
      },
      {
        "fieldName": "classCode",
        "displayName": "Classification code:",
        "displayEmpty": "All codes",
        "multiValued": true,
        "inSearch": true
      }
    ],
    "includeLemma": true,
    "cellsInRow": 3,
    "wordClasses": [
      "AJ0",
      "AJ0-AV0",
      "AJ0-NN1",
      "AJ0-VVD",
      "AJ0-VVG",
      "AJ0-VVN",
      "AJC",
      "AJS",
      "AT0",
      "AV0",
      "AV0-AJ0",
      "AVP",
      "AVP-PRP",
      "AVQ",
      "AVQ-CJS",
      "CJC",
      "CJS",
      "CJS-AVQ",
      "CJS-PRP",
      "CJT",
      "CJT-DT0",
      "CRD",
      "CRD-PNI",
      "DPS",
      "DT0",
      "DT0-CJT",
      "DTQ",
      "ENFORCEMENT",
      "EX0",
      "ITJ",
      "NN0",
      "NN1",
      "NN1-AJ0",
      "NN1-NP0",
      "NN1-VVB",
      "NN1-VVG",
      "NN2",
      "NN2-VVZ",
      "NP0",
      "NP0-NN1",
      "ORD",
      "PNI",
      "PNI-CRD",
      "PNP",
      "PNQ",
      "PNX",
      "POS",
      "PRF",
      "PRP",
      "PRP-AVP",
      "PRP-CJS",
      "TO0",
      "UNC",
      "VBB",
      "VBD",
      "VBG",
      "VBI",
      "VBN",
      "VBZ",
      "VDB",
      "VDD",
      "VDG",
      "VDI",
      "VDN",
      "VDZ",
      "VHB",
      "VHD",
      "VHG",
      "VHI",
      "VHN",
      "VHZ",
      "VM0",
      "VVB",
      "VVB-NN1",
      "VVD",
      "VVD-AJ0",
      "VVD-VVN",
      "VVG",
      "VVG-AJ0",
      "VVG-NN1",
      "VVI",
      "VVN",
      "VVN-AJ0",
      "VVN-VVD",
      "VVZ",
      "VVZ-NN2",
      "XX0",
      "ZZ0"
    ]
  }
]