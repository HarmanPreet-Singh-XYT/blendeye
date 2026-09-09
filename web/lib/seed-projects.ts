import type { ProjectData } from "@/lib/project-store";

export const AETHELGARD_DEMO_PROJECT: ProjectData = {
  "id": "aethelgard-chronos-shift",
  "title": "Aethelgard: The Chronos Shift",
  "genre": "Cosmic Sci-Fi / Space Opera",
  "premise": "In 2164, as Earth's magnetic shield collapses, an aging telemetry pilot and a theoretical astrophysicist pilot the deep-recon craft 'Chronos' into the gravitational accretion perimeter of an anomalous micro-singularity near Titan. Relativistic time dilation means every 10 minutes near the event horizon costs 3 Earth years. When an anomalous forward-echo distress signal is detected from their own ship, they have 3 minutes to recalculate their gravity slingshot before irreversible horizon capture.",
  "sceneTitle": "Echoes in the Redshift",
  "sceneSummary": "Julian isolates the anomalous distress beacon and realizes the data contains Chronos's unique hull-compression signature. Maya attempts to conceal the true origin of the signal to prevent Julian from aborting the scientific data harvest.",
  "screenplayText": "INT. CHRONOS - ACCRETION OBSERVATION DECK - CONTINUOUS\n\nA massive panoramic bay overlooks the warping curvature of space-time. Stars behind the singularity are bent into twin horseshoe halos—gravitational lensing rendered in terrifying clarity.\n\nJulian stands over a floating volumetric waveform. Maya hovers beside him, her fingers twitching over an encrypted data-slate.\n\nJULIAN\nPlay the audio packet. Pure telemetry only.\n\nMAYA\nJulian, wait. The gravitational gradient here causes extreme quantum decoherence. The sensor array is likely bouncing our own forward radar off the ergosphere's mirrored horizon.\n\nJULIAN\n(cold)\nOur forward radar doesn't broadcast in distress hexadecimals. AURA. Decode.\n\nA burst of static floods the observation deck. Through the harsh crackle comes a distorted, gasping HUMAN VOICE over the intercom:\n\nRECORDED VOICE (FILTERED)\n'--loss of attitude control... hull breach in deck three... Maya, pull the cutoff, the gravity gradient is pulling us under the event--'\n\nThe voice cuts out into a shriek of tearing metal.\n\nJulian goes deathly still. The voice on the recording was his own.\n\nJULIAN\n(slowly turning to Maya)\nThat wasn't a bounce from yesterday.\n\nMAYA\n(defensive, voice tight)\nSpace-time around a rotating Kerr micro-singularity allows closed timelike curves in the Cauchy horizon. It is a theoretical feedback loop.\n\nJULIAN\nThat is my voice dying on Deck Three. Four minutes from now.\n\nMAYA\nIt's a probability phantom! A mathematical shadow cast by the singularity's frame-dragging! If we abort now, the slingshot tears our propellant tanks and we drift into deep space with zero data!\n\nAURA-9 (V.O.)\nCorrection. Signal analysis indicates temporal forward-offset: precisely three hours, forty-eight minutes. Gravitational lensing has focused our future black-box transmission back into our current entry vector.\n\nJULIAN\n(eyes blazing)\nWe're not reading a ghost, Maya. We are reading our own tombstone.",
  "directorStyle": "Christopher Nolan",
  "coreSecret": "The automated telemetry distress beacon the crew is pursuing was not sent years ago by an earlier mission—the gravitational lensing is reflecting Chronos's own black-box transmitter broadcast from 4 hours into their future, proving they are doomed to be crushed unless they abort the slingshot.",
  "primaryLocation": "Chronos Accretion Observation Deck",
  "targetTerritories": [
    "US",
    "KR",
    "DE",
    "JP"
  ],
  "narrativeFormat": "feature",
  "targetRuntimeMinutes": 140,
  "scenePlacementSeconds": 2400,
  "sceneDurationSeconds": 300,
  "shootRegion": "Los Angeles, CA",
  "currency": "USD",
  "budget": 1200000,
  "budgetPerShootDayUsd": 95000,
  "budgetCapPolicy": "advisory",
  "budgetAllocation": {
    "locationsPct": 18,
    "locationsAmount": 216000
  },
  "characters": [
    {
      "name": "Julian Ross",
      "role": "Lead Protagonist",
      "actorComp": "Matthew McConaughey meets Christian Bale",
      "archetype": "The Reluctant Veteran / Haunted Pilot",
      "objective": "Execute the slingshot, recover planetary magnetosphere data, and return to Earth before his daughter out-ages him into oblivion.",
      "speechStyle": "Grounded, terse, rhythmic, laced with tactical jargon and simmering existential dread.",
      "dialsSummary": "Pragmatism 95% · Emotional Restraint 80% · Temporal Anxiety 90%",
      "subtextRatio": "85%",
      "imageUrl": "/cinema/characters/julian_portrait.jpg",
      "fullBodyImageUrl": "/cinema/characters/julian_fullbody.jpg"
    },
    {
      "name": "Dr. Maya Lin",
      "role": "Strategic Foil / Ambiguous Ally",
      "actorComp": "Rebecca Hall meets Carrie-Anne Moss",
      "archetype": "The Obsessive Visionary",
      "objective": "Collect the singularity's core quantum equations at any relativistic cost, believing it is Earth's only mathematical salvation.",
      "speechStyle": "Hyper-articulate, brisk, mathematically precise, concealing profound existential desperation behind empirical detachment.",
      "dialsSummary": "Intellect 98% · Obsession 92% · Deception 75%",
      "subtextRatio": "90%",
      "imageUrl": "/cinema/characters/maya_portrait.jpg",
      "fullBodyImageUrl": "/cinema/characters/maya_fullbody.jpg"
    },
    {
      "name": "AURA-9",
      "role": "Unpredictable Wildcard / Deterministic Arbiter",
      "actorComp": "Tilda Swinton (Synthesized Vocal Architecture)",
      "archetype": "The Quantum Oracle AI",
      "objective": "Maintain mission integrity and trajectory convergence according to immutable relativistic mechanics.",
      "speechStyle": "Monotone, synthetically serene, relentlessly literal, speaking in temporal probabilities and countdowns.",
      "dialsSummary": "Logic 100% · Empathy 0% · Fatalism 95%",
      "subtextRatio": "40%",
      "imageUrl": "/cinema/characters/aura_portrait.jpg",
      "fullBodyImageUrl": "/cinema/characters/aura_fullbody.jpg"
    }
  ],
  "scenes": [
    {
      "id": "scene-chronos-1",
      "sceneNumber": 1,
      "title": "The Accretion Threshold",
      "slugline": "INT. CHRONOS - FLIGHT COCKPIT - RELATIVISTIC ZERO HOUR",
      "summary": "Julian and Maya initiate the perilous gravity slingshot burn around the micro-singularity. The terrifying scale of relativistic time dilation is established just as an impossible telemetry echo registers on long-range sonar.",
      "startSeconds": 600,
      "durationSeconds": 240,
      "location": "CHRONOS FLIGHT COCKPIT (APPROACHING TITAN SINGULARITY)",
      "castPresent": [
        "Julian Ross",
        "Dr. Maya Lin",
        "AURA-9"
      ],
      "screenplayText": "INT. CHRONOS - FLIGHT COCKPIT - RELATIVISTIC ZERO HOUR\n\nStrobe-cyan emergency luminescence cuts through pressurized atmospheric mist. Beyond the triple-reinforced quartz canopy lies the Abyss: an ink-black sphere wrapped in a blinding, spinning ribbon of hyper-accelerated amber plasma.\n\nThe gravity well groans through the titanium hull—a low, visceral sub-bass vibration that resonates directly in the teeth.\n\nJULIAN ROSS (50s, hollow-eyed, veins stark against pale temples) grips the primary twin-axis thruster yoke. Knuckles white.\n\nA holographic chrono-counter floats before him, ticking down: 00:09:59... 00:09:58...\n\nJULIAN\nInertial dampeners at ninety-one percent. We are crossing the ergosphere boundary.\n\nDR. MAYA LIN (30s, sharp features, eyes reflecting the furious accretion disc) rapidly taps an illuminated glass console. Her breathing is controlled, almost reverent.\n\nMAYA\nGravitational shear is within three sigma. Keep the nose pitched four degrees off the photon ring, Julian. If we slip into the photon sphere, our orbital velocity becomes infinite.\n\nAURA-9 (V.O.)\nRelativistic slip engaged. Local frame rate: one second per Chronos equals one hundred and fifty-seven Earth days. Current voyage cost: two years, eleven months, four days.\n\nJulian's jaw clenches. A vein throbs in his neck.\n\nJULIAN\nEvery breath in this chair is a season on Earth. Maya, tell me your sensor array is actually drinking something useful.\n\nMAYA\n(without looking up)\nThe magnetic flux data is streaming. If we maintain this arc for three hundred seconds, we have the planetary core restoration model.\n\nA sharp, synthetic CHIME breaks the hum. A high-frequency distress tone pulses from the central telemetry HUD. Erratic. Piercing.\n\nJULIAN\n(frowning)\nAURA. Filter that. What is pinging an emergency transponder in an uncharted singularity orbit?\n\nAURA-9 (V.O.)\nSignal detected on narrow-band subspace 14.8 GHz. Encrypted with United Earth Stellar Command telemetry protocols.\n\nMAYA\n(freezes, eyes narrowing)\nThat's impossible. We are the first deep-recon hull cleared for the Saturnian gravity well.\n\nJULIAN\nIdentify the transponder registry.\n\nAURA-9 (V.O.)\nSignal source is designated: Deep Recon Vessel Chronos. Black-Box Beacon Zero-One.",
      "directorStyle": "Christopher Nolan",
      "coreSecret": "The automated telemetry distress beacon the crew is pursuing was not sent years ago by an earlier mission—the gravitational lensing is reflecting Chronos's own black-box transmitter broadcast from 4 hours into their future, proving they are doomed to be crushed unless they abort the slingshot.",
      "preview_image_url": "/cinema/scenes/scene_1_storyboard_accretion.jpg",
      "selectedLocationCandidateId": "loc_01_laurel_canyon",
      "sceneImages": [
        {
                "id": "img-sc1-01",
                "url": "/cinema/scenes/scene_1_storyboard_accretion.jpg",
                "prompt": "2.39:1 low-angle cinematic anamorphic frame: Julian Ross confronts Dr. Maya Lin; volumetric lighting and atmospheric tension.",
                "title": "Accretion Horizon Frame",
                "createdAt": 1788919223000,
                "source": "location"
        },
        {
                "id": "img-sc1-02",
                "url": "/cinema/scenes/scene_1_cockpit_approach.jpg",
                "prompt": "Wide establishing master shot, 24mm prime lens, architectural wide angle: Cockpit approaching singularity.",
                "title": "Cockpit Singularity Entry",
                "createdAt": 1788919223000,
                "source": "location"
        },
        {
                "id": "img-sc1-03",
                "url": "/cinema/scenes/scene_1_canopy_insert.jpg",
                "prompt": "Wide establishing master shot: Cockpit telemetry displays reflecting across flight consoles.",
                "title": "Flight Avionics Telemetry",
                "createdAt": 1788919223000,
                "source": "location"
        },
        {
                "id": "img-sc1-04",
                "url": "/cinema/scenes/scene_1_avionics_telemetry.jpg",
                "prompt": "2.39:1 Anamorphic Scope, Environmental / Insert Frame: Pressurized canopy view.",
                "title": "Pressurized Canopy Insert",
                "createdAt": 1788919223000,
                "source": "location"
        },
        {
                "id": "img-sc1-05",
                "url": "/cinema/scenes/scene_4_asymmetric_burn.jpg",
                "prompt": "2.39:1 Anamorphic Scope, Environmental Frame: Slow Creeping Dolly In on Julian Ross.",
                "title": "Cockpit Dolly Staging",
                "createdAt": 1788919223000,
                "source": "location"
        }
],
      "locationCandidates": [
        {
          "name": "Laurel Canyon Stages - Sci-Fi Spaceship Cockpit & Flight Deck",
          "region": "Arleta, Los Angeles, CA",
          "sources": [
            {
              "url": "https://www.filmla.com",
              "title": "FilmLA Standard Fee Schedule & Guidelines"
            },
            {
              "url": "https://lcstages.com",
              "title": "Parallel Web: Laurel Canyon Stages Sci-Fi Spec Sheet"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.95,
          "candidate_id": "loc_01_laurel_canyon",
          "preview_image_url": "/cinema/locations/laurel_canyon_cockpit.jpg",
          "gallery_images": [{"id":"gal-01-laurel","url":"/cinema/locations/laurel_canyon_cockpit.jpg","title":"Laurel Canyon Stages Sci-Fi Cockpit","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "FilmLA basic motion permit with certified soundstage waiver; stage rate includes pre-lit practical flight consoles and control panels.",
            "currency": "USD",
            "day_rate": 3600,
            "permit_fee": 931
          },
          "film_precedents": [
            {
              "why": "Tactile switchgear, analog flight telemetry, and high-contrast instrument glow simulating deep space acceleration.",
              "film": "Interstellar (2014)",
              "director": "Christopher Nolan"
            },
            {
              "why": "Tight interior cockpit geometry built to convey intense gravitational shear and g-force strain.",
              "film": "The Expanse (2015-2022)",
              "director": "Various"
            }
          ],
          "practical_notes": "Ground-level drive-in elephant doors (12' x 14'); separate production bullpen, green rooms, and hair/makeup stations included.",
          "score_breakdown": {
            "budget_fit": 0.94,
            "creative_fit": 0.96,
            "shootability": 0.95,
            "consolidation_bonus": 0.98
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-2",
            "scene-gen-1788918946951-3",
            "scene-gen-1788918946951-4"
          ]
        },
        {
          "name": "Fonco Studios - Modular Spaceship Cockpit & Insert Stage",
          "region": "Glassell Park / Los Angeles, CA",
          "sources": [
            {
              "url": "https://foncostudios.com",
              "title": "Parallel Web: Fonco Studios Production Stages"
            },
            {
              "url": "https://www.filmla.com",
              "title": "FilmLA City Permitting Office"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.92,
          "candidate_id": "loc_01_fonco",
          "preview_image_url": "/cinema/locations/fonco_cockpit.jpg",
          "gallery_images": [{"id":"gal-01-fonco","url":"/cinema/locations/fonco_cockpit.jpg","title":"Fonco Studios Modular Cockpit","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Cost includes modular 26'x46' spaceship standing set with configurable pilot console and adjacent cyc.",
            "currency": "USD",
            "day_rate": 2400,
            "permit_fee": 931
          },
          "film_precedents": [
            {
              "why": "Claustrophobic, practical retro-futuristic cockpit controls and dense industrial mechanical detail.",
              "film": "Alien (1979)",
              "director": "Ridley Scott"
            }
          ],
          "practical_notes": "Roll-up bay door access, dedicated hair/makeup station, prop department support on site.",
          "score_breakdown": {
            "budget_fit": 0.96,
            "creative_fit": 0.88,
            "shootability": 0.9,
            "consolidation_bonus": 0.92
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-2",
            "scene-gen-1788918946951-3",
            "scene-gen-1788918946951-4"
          ]
        },
        {
          "name": "L.A. Castle Studios - Unreal Engine LED Virtual Production Stage",
          "region": "Burbank, CA",
          "sources": [
            {
              "url": "https://www.lacastlestudios.com",
              "title": "Parallel Web: L.A. Castle Studios Virtual Production Standing Stages"
            },
            {
              "url": "https://www.burbankca.gov",
              "title": "Burbank Film Permit Coordination"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.9,
          "candidate_id": "loc_01_la_castle",
          "preview_image_url": "/cinema/locations/la_castle_volume.jpg",
          "gallery_images": [{"id":"gal-01-castle","url":"/cinema/locations/la_castle_volume.jpg","title":"L.A. Castle Studios LED Volume Stage","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Includes full Unreal Engine 5 real-time background rendering and camera tracking volume for real-time singularity vistas.",
            "currency": "USD",
            "day_rate": 6500,
            "permit_fee": 931
          },
          "film_precedents": [
            {
              "why": "Real-time LED volume projection rendering hyper-realistic cosmic backdrop reflections across helmets and cockpit glass.",
              "film": "The Mandalorian (2019-)",
              "director": "Jon Favreau"
            }
          ],
          "practical_notes": "Dedicated 10Gbps optical uplink, color-calibrated display wall, private star dressing suites.",
          "score_breakdown": {
            "budget_fit": 0.82,
            "creative_fit": 0.98,
            "shootability": 0.92,
            "consolidation_bonus": 0.9
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-2",
            "scene-gen-1788918946951-3",
            "scene-gen-1788918946951-4"
          ]
        }
      ]
    },
    {
      "id": "scene-chronos-2",
      "sceneNumber": 2,
      "title": "Echoes in the Redshift",
      "slugline": "INT. CHRONOS - ACCRETION OBSERVATION DECK - CONTINUOUS",
      "summary": "Julian isolates the anomalous distress beacon and realizes the data contains Chronos's unique hull-compression signature. Maya attempts to conceal the true origin of the signal to prevent Julian from aborting the scientific data harvest.",
      "startSeconds": 2400,
      "durationSeconds": 300,
      "location": "CHRONOS ACCRETION OBSERVATION DECK",
      "castPresent": [
        "Julian Ross",
        "Dr. Maya Lin",
        "AURA-9"
      ],
      "screenplayText": "INT. CHRONOS - ACCRETION OBSERVATION DECK - CONTINUOUS\n\nA massive panoramic bay overlooks the warping curvature of space-time. Stars behind the singularity are bent into twin horseshoe halos—gravitational lensing rendered in terrifying clarity.\n\nJulian stands over a floating volumetric waveform. Maya hovers beside him, her fingers twitching over an encrypted data-slate.\n\nJULIAN\nPlay the audio packet. Pure telemetry only.\n\nMAYA\nJulian, wait. The gravitational gradient here causes extreme quantum decoherence. The sensor array is likely bouncing our own forward radar off the ergosphere's mirrored horizon.\n\nJULIAN\n(cold)\nOur forward radar doesn't broadcast in distress hexadecimals. AURA. Decode.\n\nA burst of static floods the observation deck. Through the harsh crackle comes a distorted, gasping HUMAN VOICE over the intercom:\n\nRECORDED VOICE (FILTERED)\n'--loss of attitude control... hull breach in deck three... Maya, pull the cutoff, the gravity gradient is pulling us under the event--'\n\nThe voice cuts out into a shriek of tearing metal.\n\nJulian goes deathly still. The voice on the recording was his own.\n\nJULIAN\n(slowly turning to Maya)\nThat wasn't a bounce from yesterday.\n\nMAYA\n(defensive, voice tight)\nSpace-time around a rotating Kerr micro-singularity allows closed timelike curves in the Cauchy horizon. It is a theoretical feedback loop.\n\nJULIAN\nThat is my voice dying on Deck Three. Four minutes from now.\n\nMAYA\nIt's a probability phantom! A mathematical shadow cast by the singularity's frame-dragging! If we abort now, the slingshot tears our propellant tanks and we drift into deep space with zero data!\n\nAURA-9 (V.O.)\nCorrection. Signal analysis indicates temporal forward-offset: precisely three hours, forty-eight minutes. Gravitational lensing has focused our future black-box transmission back into our current entry vector.\n\nJULIAN\n(eyes blazing)\nWe're not reading a ghost, Maya. We are reading our own tombstone.",
      "directorStyle": "Christopher Nolan",
      "coreSecret": "The automated telemetry distress beacon the crew is pursuing was not sent years ago by an earlier mission—the gravitational lensing is reflecting Chronos's own black-box transmitter broadcast from 4 hours into their future, proving they are doomed to be crushed unless they abort the slingshot.",
      "preview_image_url": "/cinema/locations/observation_deck_wide.jpg",
      "selectedLocationCandidateId": "loc_02_la_castle_volume",
      "sceneImages": [
        {
                "id": "img-sc2-01",
                "url": "/cinema/locations/observation_deck_wide.jpg",
                "prompt": "Cinematic movie keyframe still. Wide establishing master shot, 24mm prime lens: Accretion Observation Deck.",
                "title": "Observation Deck Wide Plate",
                "createdAt": 1788919223000,
                "source": "location"
        },
        {
                "id": "img-sc2-02",
                "url": "/cinema/locations/observation_deck_lensing.jpg",
                "prompt": "Real-world film location: L.A. Castle Studios - Deep Space Observation Volume, Burbank, CA.",
                "title": "Observation Volume Keyframe",
                "createdAt": 1788919223000,
                "source": "location"
        },
        {
                "id": "img-sc2-03",
                "url": "/cinema/locations/observation_deck_terminal.jpg",
                "prompt": "Wide establishing master shot: Gravitational lensing halos visible through viewport.",
                "title": "Ergosphere Horizon Curvature",
                "createdAt": 1788919223000,
                "source": "location"
        },
        {
                "id": "img-sc2-04",
                "url": "/cinema/locations/la_castle_observation.jpg",
                "prompt": "Wide establishing master shot: Volumetric waveform telemetry terminal.",
                "title": "Telemetry Waveform Station",
                "createdAt": 1788919223000,
                "source": "location"
        }
],
      "locationCandidates": [
        {
          "name": "Laurel Canyon Stages - Sci-Fi Laboratory & Observation Bay Module",
          "region": "Arleta, Los Angeles, CA",
          "sources": [
            {
              "url": "https://www.filmla.com",
              "title": "FilmLA Motion Permit Rider Schedule"
            },
            {
              "url": "https://lcstages.com",
              "title": "Parallel Web: Laurel Canyon Stage 2 Blueprint"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.95,
          "candidate_id": "loc_02_laurel_canyon_module",
          "preview_image_url": "/cinema/locations/observation_deck_wide.jpg",
          "gallery_images": [{"id":"gal-02-laurel","url":"/cinema/locations/observation_deck_wide.jpg","title":"Laurel Canyon Observation Bay","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Permit covered under master multi-day FilmLA soundstage permit application ($148.75 rider fee).",
            "currency": "USD",
            "day_rate": 3600,
            "permit_fee": 149
          },
          "film_precedents": [
            {
              "why": "Gilded observation deck overlooking an all-consuming cosmic phenomenon with stark psychological tension.",
              "film": "Sunshine (2007)",
              "director": "Danny Boyle"
            },
            {
              "why": "Cool-toned metallic corridors and observation suites framing philosophical dread.",
              "film": "Solaris (2002)",
              "director": "Steven Soderbergh"
            }
          ],
          "practical_notes": "Modular panels can be pushed out to create a 30-foot deep sightline for observation window framing.",
          "score_breakdown": {
            "budget_fit": 0.95,
            "creative_fit": 0.94,
            "shootability": 0.96,
            "consolidation_bonus": 1
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-1",
            "scene-gen-1788918946951-3",
            "scene-gen-1788918946951-4"
          ]
        },
        {
          "name": "L.A. Castle Studios - Deep Space Observation Volume",
          "region": "Burbank, CA",
          "sources": [
            {
              "url": "https://www.lacastlestudios.com",
              "title": "Parallel Web: L.A. Castle Studios Space Station & Sci-Fi Set"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.9,
          "candidate_id": "loc_02_la_castle_volume",
          "preview_image_url": "/cinema/locations/observation_deck_lensing.jpg",
          "gallery_images": [{"id":"gal-02-castle","url":"/cinema/locations/observation_deck_lensing.jpg","title":"L.A. Castle Deep Space Volume","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Consolidated onto single master Burbank studio booking; covers real-time singularity lensing.",
            "currency": "USD",
            "day_rate": 6500,
            "permit_fee": 149
          },
          "film_precedents": [
            {
              "why": "High-fidelity planetary vistas refracting against thick interior glass and observation viewports.",
              "film": "Ad Astra (2019)",
              "director": "James Gray"
            }
          ],
          "practical_notes": "Turnkey tracking cameras, calibrated Unreal engine playback, dedicated high-speed server racks.",
          "score_breakdown": {
            "budget_fit": 0.81,
            "creative_fit": 0.97,
            "shootability": 0.94,
            "consolidation_bonus": 0.91
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-1",
            "scene-gen-1788918946951-3",
            "scene-gen-1788918946951-4"
          ]
        },
        {
          "name": "Downtown LA Arts District - Concrete Brutalist Subterranean Turbine Hall",
          "region": "Downtown Los Angeles, CA",
          "sources": [
            {
              "url": "https://www.filmla.com",
              "title": "Parallel Web: FilmLA Arts District Common Fees & Guidelines"
            },
            {
              "url": "https://www.ladwp.com",
              "title": "LADWP Commercial Filming Guidelines"
            }
          ],
          "category": "industrial-dock",
          "rank_score": 0.84,
          "candidate_id": "loc_02_vortex_arts_district",
          "preview_image_url": "/cinema/locations/observation_deck_terminal.jpg",
          "gallery_images": [{"id":"gal-02-arts","url":"/cinema/locations/observation_deck_terminal.jpg","title":"Subterranean Turbine Hall","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "FilmLA basic permit plus LADWP facility commercial location fee for industrial interior filming.",
            "currency": "USD",
            "day_rate": 4200,
            "permit_fee": 931
          },
          "film_precedents": [
            {
              "why": "Monolithic concrete brutalist volumes creating heavy scale and acoustic gravity.",
              "film": "Blade Runner 2049 (2017)",
              "director": "Denis Villeneuve"
            }
          ],
          "practical_notes": "Freight elevator access only; FilmLA community notification radius required 7 days prior.",
          "score_breakdown": {
            "budget_fit": 0.88,
            "creative_fit": 0.91,
            "shootability": 0.79,
            "consolidation_bonus": 0.65
          },
          "search_grounded": true,
          "shared_with_scenes": []
        }
      ]
    },
    {
      "id": "scene-chronos-3",
      "sceneNumber": 3,
      "title": "Point of Irreversible Perigee",
      "slugline": "INT. CHRONOS - FLIGHT COCKPIT - T-MINUS 3 MINUTES TO PERIGEE",
      "summary": "With only 180 seconds until the gravitational slingshot becomes irreversible, Julian attempts to fire the counter-burn thrusters to break orbit. Maya draws an override protocol to lock the helm, forcing a philosophical and physical standoff.",
      "startSeconds": 5400,
      "durationSeconds": 240,
      "location": "CHRONOS FLIGHT COCKPIT",
      "castPresent": [
        "Julian Ross",
        "Dr. Maya Lin",
        "AURA-9"
      ],
      "screenplayText": "INT. CHRONOS - FLIGHT COCKPIT - T-MINUS 3 MINUTES TO PERIGEE\n\nThe cockpit alarms howl in alternating frequencies of AMBER and CRIMSON. Outside, the event horizon has swallowed half the cosmos. The singularity is a wall of velvet darkness edged with blinding violet radiation.\n\nThe timer on the HUD: 00:02:59... 00:02:58...\n\nJulian slams his palm onto the manual RCS primary controls. Mechanical levers disengage with a heavy CLUNK.\n\nJULIAN\nAURA, disengage orbital lock. Plot emergency retrograde burn. Burn one hundred percent of secondary hydrazine.\n\nAURA-9 (V.O.)\nCommand locked. Awaiting dual-key confirmation.\n\nMaya steps between Julian and the secondary console, her hand clamped over the optical authorization key.\n\nMAYA\nDo not enter that code, Julian.\n\nJULIAN\n(stepping forward, towering)\nMaya, if we cross the point of no return in two minutes, that recording becomes reality. Chronos breaks in half. We die, and Earth gets nothing.\n\nMAYA\nAnd if we retro-burn, we lose forty percent of our orbital velocity! The time dilation will spike exponentially while we struggle to crawl out of the gravity well! Julian... ten minutes here is three years. A forty-minute crawl out of the lower apron will cost Earth TWENTY-FIVE YEARS.\n\nJulian pauses, struck as if physically hit.\n\nMAYA (CONT'D)\n(voice cracking with raw agony)\nYour daughter will be an old woman. My brothers will be dead. The magnetosphere will have stripped Earth's atmosphere to bone before our data arrives! We either thread the needle through the singularity perigee or we doom the planet we're trying to save!\n\nJULIAN\nWe can't thread a needle that snaps our hull, Maya!\n\nAURA-9 (V.O.)\nT-minus one hundred and twenty seconds to irreversible horizon capture. Tidal force delta increasing by four hundred giga-pascals per second.",
      "directorStyle": "Christopher Nolan",
      "coreSecret": "The automated telemetry distress beacon the crew is pursuing was not sent years ago by an earlier mission—the gravitational lensing is reflecting Chronos's own black-box transmitter broadcast from 4 hours into their future, proving they are doomed to be crushed unless they abort the slingshot.",
      "preview_image_url": "/cinema/scenes/scene_1_cockpit_approach.jpg",
      "selectedLocationCandidateId": "loc_03_laurel_canyon_cockpit",
      "sceneImages": [
        {
                "id": "img-sc3-01",
                "url": "/cinema/scenes/scene_1_cockpit_approach.jpg",
                "prompt": "High-tension cockpit standoff at perigee threshold.",
                "title": "Perigee Cockpit Standoff",
                "createdAt": 1788919223000,
                "source": "location"
        },
        {
                "id": "img-sc3-02",
                "url": "/cinema/scenes/scene_1_canopy_insert.jpg",
                "prompt": "Cockpit alarms in alternating amber and crimson strobe.",
                "title": "Emergency Thruster Override",
                "createdAt": 1788919223000,
                "source": "location"
        }
],
      "locationCandidates": [
        {
          "name": "Laurel Canyon Stages - Flight Cockpit Standoff Rig",
          "region": "Arleta, Los Angeles, CA",
          "sources": [
            {
              "url": "https://www.filmla.com",
              "title": "FilmLA Motion Permit Rider Guide"
            },
            {
              "url": "https://lcstages.com",
              "title": "Parallel Web: Laurel Canyon Stage 1 Tech Specs"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.96,
          "candidate_id": "loc_03_laurel_canyon_cockpit",
          "preview_image_url": "/cinema/locations/laurel_canyon_cockpit.jpg",
          "gallery_images": [{"id":"gal-03-laurel","url":"/cinema/locations/laurel_canyon_cockpit.jpg","title":"Laurel Canyon Cockpit Standoff","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Rider added to existing master permit; includes lockable flight console and wild overhead ceiling sections.",
            "currency": "USD",
            "day_rate": 3600,
            "permit_fee": 149
          },
          "film_precedents": [
            {
              "why": "High-velocity cockpit camera choreography capturing extreme claustrophobia and life-or-death decision points.",
              "film": "Gravity (2013)",
              "director": "Alfonso Cuarón"
            },
            {
              "why": "Dutch-angle close-quarters command standoff lit by flashing emergency secondary lighting.",
              "film": "Crimson Tide (1995)",
              "director": "Tony Scott"
            }
          ],
          "practical_notes": "Direct bay-door loading for gimbal hydraulic rigs or camera jib extensions.",
          "score_breakdown": {
            "budget_fit": 0.95,
            "creative_fit": 0.97,
            "shootability": 0.96,
            "consolidation_bonus": 1
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-1",
            "scene-gen-1788918946951-2",
            "scene-gen-1788918946951-4"
          ]
        },
        {
          "name": "Fonco Studios - Sci-Fi Pilot Cockpit & Standoff Rig",
          "region": "Glassell Park / Los Angeles, CA",
          "sources": [
            {
              "url": "https://foncostudios.com",
              "title": "Parallel Web: Fonco Studios Sci-Fi Set Details"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.92,
          "candidate_id": "loc_03_fonco_cockpit",
          "preview_image_url": "/cinema/locations/fonco_cockpit.jpg",
          "gallery_images": [{"id":"gal-03-fonco","url":"/cinema/locations/fonco_cockpit.jpg","title":"Fonco Standoff Rig","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Multi-day stage extension rider; includes pilot console override locking mechanics.",
            "currency": "USD",
            "day_rate": 2400,
            "permit_fee": 149
          },
          "film_precedents": [
            {
              "why": "Industrial, tactile base station interfaces where system lockdowns are physical and immediate.",
              "film": "Moon (2009)",
              "director": "Duncan Jones"
            }
          ],
          "practical_notes": "Modular cockpit seats can be unbolted for low-angle hand-to-hand fight choreography.",
          "score_breakdown": {
            "budget_fit": 0.96,
            "creative_fit": 0.89,
            "shootability": 0.91,
            "consolidation_bonus": 0.93
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-1",
            "scene-gen-1788918946951-2",
            "scene-gen-1788918946951-4"
          ]
        },
        {
          "name": "The Villa Serena - Space Shuttle & Cockpit Standing Set",
          "region": "Sun Valley, CA",
          "sources": [
            {
              "url": "https://www.thevillaserena.com",
              "title": "Parallel Web: The Villa Serena Space Shuttle Standing Set Specs"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.89,
          "candidate_id": "loc_03_villa_serena",
          "preview_image_url": "/cinema/locations/la_castle_volume.jpg",
          "gallery_images": [{"id":"gal-03-serena","url":"/cinema/locations/la_castle_volume.jpg","title":"Space Shuttle Standing Set","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Includes 11'x11' space shuttle / transport cockpit standing set with LED instrument panels and front green screen.",
            "currency": "USD",
            "day_rate": 2800,
            "permit_fee": 931
          },
          "film_precedents": [
            {
              "why": "Ultra-tight mechanical cockpit environment with actors locked into physical switch controls during fatal emergency protocols.",
              "film": "Apollo 13 (1995)",
              "director": "Ron Howard"
            }
          ],
          "practical_notes": "Front and side green screen backdrops built-in; off-street truck parking for 5-ton grip package.",
          "score_breakdown": {
            "budget_fit": 0.94,
            "creative_fit": 0.85,
            "shootability": 0.88,
            "consolidation_bonus": 0.82
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-1",
            "scene-gen-1788918946951-4"
          ]
        }
      ]
    },
    {
      "id": "scene-chronos-4",
      "sceneNumber": 4,
      "title": "The Asymmetric Slingshot (Temporal Cost)",
      "slugline": "INT. CHRONOS - FLIGHT COCKPIT - MOMENTS TO EVENT HORIZON",
      "summary": "Julian deciphers the telemetry paradox and realizes the future crash occurred because they tried to execute Maya's slingshot without accounting for singularity frame-drag. Together, they execute an unorthodox asymmetric vector burn, escaping deterministic death while paying a catastrophic temporal price.",
      "startSeconds": 7800,
      "durationSeconds": 360,
      "location": "CHRONOS FLIGHT COCKPIT (POINT OF MAXIMUM SHEAR)",
      "castPresent": [
        "Julian Ross",
        "Dr. Maya Lin",
        "AURA-9"
      ],
      "screenplayText": "INT. CHRONOS - FLIGHT COCKPIT - MOMENTS TO EVENT HORIZON\n\nT-MINUS 00:00:45...\n\nThe cockpit canopy shudders violent, micro-fracturing spiderwebs blooming across the outer thermal glass. The shriek of tearing titanium echoes through Deck Three—identical to the audio transmission.\n\nJulian stares at the telemetry wave on Maya's screen. The epiphany hits him with blinding force.\n\nJULIAN\nLook at the stress fracture telemetry from the future signal! It wasn't the gravity well that crushed us... it was the yaw thrusters trying to maintain your theoretical trajectory against the spin of the singularity!\n\nMaya looks down at the data stream. Her eyes widen as the mathematics align.\n\nMAYA\nThe frame-dragging... it's rotating space itself faster than our stabilizer can counter. If we fight the spin, the hull shears. If we ride it--\n\nJULIAN\nWe don't retro-burn, and we don't hold the planned line. We invert the ship. We burn directly INTO the rotation vector. We use the singularity's own angular momentum to slingshot us outward!\n\nMAYA\nThat will shoot our exit trajectory thirty degrees off course! The relativistic penalty will be brutal!\n\nJULIAN\n(slamming both hands onto the controls)\nIt's life or deterministic suicide, Maya! Key the thrusters!\n\nMaya slams her authorization key down. The interface flashes GREEN.\n\nMAYA\nAuthorization confirmed! Full power to inverted lateral arrays!\n\nJULIAN\nAURA! FIRE EVERYTHING!\n\nAURA-9 (V.O.)\nExecuting asymmetric burn. Horizon proximity: critical.\n\nA blinding wall of white-hot plasma wraps the cockpit. The violent rattling hits an unbearable crescendo. Julian and Maya are crushed back into their acceleration seats under 9-G forces.\n\nThrough the fractured canopy, the black abyss of the singularity whips past in an instant—and then... EXODUS.\n\nThe starfield snaps back into brilliant, unbroken silver diamonds against pure black.\n\nThe alarm tones die down. The roaring engines fade into the low hum of life support.\n\nJulian gasps for oxygen, wiping blood from his nose. Maya sits trembling, staring at the telemetry stream on her terminal. The data is complete.\n\nMAYA\n(whispering)\nWe made it. We broke the loop. The data is intact.\n\nJulian looks slowly up at the chrono-display. The local time reads: 00:14:12.\n\nBeside it, the Earth Relative Elapsed Clock updates in cold, glowing digits:\n\n+18 YEARS, 4 MONTHS, 12 DAYS.\n\nJulian stares into the silent void of space, tears carving clean tracks through the soot on his face.\n\nJULIAN\n(softly)\nWe saved the world. But everyone we knew is gone.\n\nFADE OUT.",
      "directorStyle": "Christopher Nolan",
      "coreSecret": "The automated telemetry distress beacon the crew is pursuing was not sent years ago by an earlier mission—the gravitational lensing is reflecting Chronos's own black-box transmitter broadcast from 4 hours into their future, proving they are doomed to be crushed unless they abort the slingshot.",
      "preview_image_url": "/cinema/scenes/scene_4_asymmetric_burn.jpg",
      "selectedLocationCandidateId": "loc_04_la_castle_inversion",
      "sceneImages": [
        {
                "id": "img-sc4-01",
                "url": "/cinema/scenes/scene_4_asymmetric_burn.jpg",
                "prompt": "Asymmetric vector burn along singularity rotation horizon.",
                "title": "Asymmetric Singularity Burn",
                "createdAt": 1788919223000,
                "source": "location"
        },
        {
                "id": "img-sc4-02",
                "url": "/cinema/scenes/scene_1_storyboard_accretion.jpg",
                "prompt": "Exodus into silence: Earth Relative Elapsed Clock updates.",
                "title": "Temporal Horizon Exodus",
                "createdAt": 1788919223000,
                "source": "location"
        }
],
      "locationCandidates": [
        {
          "name": "Laurel Canyon Stages - Extreme Shear Cockpit Rig (Event Horizon)",
          "region": "Arleta, Los Angeles, CA",
          "sources": [
            {
              "url": "https://www.filmla.com",
              "title": "FilmLA Special Effects & Fire Safety Officer Regulations"
            },
            {
              "url": "https://lcstages.com",
              "title": "Parallel Web: Laurel Canyon Stage 1 Safety Sheet"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.96,
          "candidate_id": "loc_04_laurel_canyon_inversion",
          "preview_image_url": "/cinema/locations/laurel_canyon_cockpit.jpg",
          "gallery_images": [{"id":"gal-04-laurel","url":"/cinema/locations/laurel_canyon_cockpit.jpg","title":"Laurel Canyon Shear Rig","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Rider on existing permit; includes hard points for camera shake rigs and high-intensity strobe tie-ins.",
            "currency": "USD",
            "day_rate": 3600,
            "permit_fee": 149
          },
          "film_precedents": [
            {
              "why": "Visceral, frame-distorting gravitational shear lighting and violent cockpit vibrations at singularity boundary.",
              "film": "Event Horizon (1997)",
              "director": "Paul W.S. Anderson"
            },
            {
              "why": "High-intensity dynamic anamorphic flares and kinetic hand-held cockpit maneuvers during warp/black-hole implosion.",
              "film": "Star Trek (2009)",
              "director": "J.J. Abrams"
            }
          ],
          "practical_notes": "Stage ventilation exhaust fans can clear atmospheric fog/smoke within 3 minutes between takes.",
          "score_breakdown": {
            "budget_fit": 0.95,
            "creative_fit": 0.98,
            "shootability": 0.95,
            "consolidation_bonus": 1
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-1",
            "scene-gen-1788918946951-2",
            "scene-gen-1788918946951-3"
          ]
        },
        {
          "name": "Fonco Studios - Cockpit Kinetic FX Stage",
          "region": "Glassell Park / Los Angeles, CA",
          "sources": [
            {
              "url": "https://foncostudios.com",
              "title": "Parallel Web: Fonco Studios Standing Sci-Fi Specs"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.92,
          "candidate_id": "loc_04_fonco_inversion",
          "preview_image_url": "/cinema/locations/fonco_cockpit.jpg",
          "gallery_images": [{"id":"gal-04-fonco","url":"/cinema/locations/fonco_cockpit.jpg","title":"Fonco Kinetic Stage","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Includes SFX air cannon mounting points and pre-lit modular instrument consoles.",
            "currency": "USD",
            "day_rate": 2400,
            "permit_fee": 227
          },
          "film_precedents": [
            {
              "why": "Handheld documentary realism, blown circuit breakers, and chaotic pilot reactions under catastrophic spatial strain.",
              "film": "Battlestar Galactica (2004-2009)",
              "director": "Various"
            }
          ],
          "practical_notes": "Bay door allows rapid smoke clearance between takes.",
          "score_breakdown": {
            "budget_fit": 0.96,
            "creative_fit": 0.88,
            "shootability": 0.9,
            "consolidation_bonus": 0.93
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-1",
            "scene-gen-1788918946951-2",
            "scene-gen-1788918946951-3"
          ]
        },
        {
          "name": "L.A. Castle Studios - Singularity Inversion LED Volume Stage",
          "region": "Burbank, CA",
          "sources": [
            {
              "url": "https://www.lacastlestudios.com",
              "title": "Parallel Web: L.A. Castle Studios Technical Rigging Guidelines"
            }
          ],
          "category": "studio-backlot",
          "rank_score": 0.9,
          "candidate_id": "loc_04_la_castle_inversion",
          "preview_image_url": "/cinema/locations/la_castle_volume.jpg",
          "gallery_images": [{"id":"gal-04-castle","url":"/cinema/locations/la_castle_volume.jpg","title":"Singularity LED Volume","createdAt":1788919079000,"style_preset":"35mm_anamorphic","camera_framing":"wide_master"}],
          "estimated_cost": {
            "notes": "Includes dynamic real-time frame-drag visual simulation on surround LED panels.",
            "currency": "USD",
            "day_rate": 6500,
            "permit_fee": 227
          },
          "film_precedents": [
            {
              "why": "Stargate singularity light patterns reflecting across human expressions of transcendence and terror.",
              "film": "2001: A Space Odyssey (1968)",
              "director": "Stanley Kubrick"
            }
          ],
          "practical_notes": "Requires optical tracking calibration before start of day; LED protection screens required for intense kinetic stunts.",
          "score_breakdown": {
            "budget_fit": 0.81,
            "creative_fit": 0.99,
            "shootability": 0.93,
            "consolidation_bonus": 0.91
          },
          "search_grounded": true,
          "shared_with_scenes": [
            "scene-gen-1788918946951-1",
            "scene-gen-1788918946951-2",
            "scene-gen-1788918946951-3"
          ]
        }
      ]
    }
  ],
  "activeSceneId": "scene-chronos-2",
  "nodes": [
    {
      "id": "node-clip-1",
      "data": {
        "url": "cinematic-study.mp4",
        "title": "Ridley Scott / Tarkovsky Vacuum Study",
        "pacing": "Taut slow-burn escalating into psychological collision",
        "palette": [
          "#050811",
          "#1e1b4b",
          "#f59e0b",
          "#ef4444",
          "#38bdf8"
        ],
        "lightingStyle": "High-contrast vacuum strobes, amber warning halos, atmospheric haze",
        "timestampRange": "01:10 - 02:45"
      },
      "type": "clip",
      "measured": {
        "width": 320,
        "height": 229
      },
      "position": {
        "x": -380,
        "y": -40
      }
    },
    {
      "id": "node-note-1",
      "data": {
        "content": "In 2164, as Earth's magnetic shield collapses, an aging telemetry pilot and a theoretical astrophysicist pilot the deep-recon craft 'Chronos' into the gravitational accretion perimeter of an anomalous micro-singularity near Titan. Relativistic time dilation means every 10 minutes near the event horizon costs 3 Earth years. When an anomalous forward-echo distress signal is detected from their own ship, they have 3 minutes to recalculate their gravity slingshot before irreversible horizon capture.",
        "noteType": "Core Premise",
        "audioDuration": "00:45"
      },
      "type": "note",
      "measured": {
        "width": 320,
        "height": 223
      },
      "position": {
        "x": -380,
        "y": 220
      }
    },
    {
      "id": "node-actor-julian ross",
      "data": {
        "actorName": "Matthew McConaughey meets Christian Bale",
        "vocalWeight": "Grounded, terse, rhythmic, laced with tactical jargon and simmering existential dread.",
        "energyProfile": "The Reluctant Veteran / Haunted Pilot",
        "roleReference": "Psychological Cadence Profile (Grounded, terse, rhythmic, laced with tactical jargon and simmering existential dread.)",
        "imageUrl": "/cinema/characters/julian_portrait.jpg"
      },
      "type": "actor",
      "measured": {
        "width": 320,
        "height": 293
      },
      "position": {
        "x": -380,
        "y": 440
      }
    },
    {
      "id": "node-dial-julian ross",
      "data": {
        "speed": 75,
        "subtext": 85,
        "confidence": 60,
        "presetName": "Julian Ross Behavioral Dial"
      },
      "type": "personality",
      "measured": {
        "width": 320,
        "height": 234
      },
      "position": {
        "x": -380,
        "y": 620
      }
    },
    {
      "id": "node-quirks-julian ross",
      "data": {
        "tics": [
          "Subtext ratio: 85%",
          "Avoids direct answers when pressed on motives"
        ]
      },
      "type": "quirks",
      "measured": {
        "width": 320,
        "height": 165
      },
      "position": {
        "x": -380,
        "y": 800
      }
    },
    {
      "id": "node-core-julian ross",
      "data": {
        "name": "Julian Ross",
        "actorComp": "Matthew McConaughey meets Christian Bale",
        "archetype": "The Reluctant Veteran / Haunted Pilot",
        "objective": "Execute the slingshot, recover planetary magnetosphere data, and return to Earth before his daughter out-ages him into oblivion.",
        "dialsSummary": "Pragmatism 95% · Emotional Restraint 80% · Temporal Anxiety 90%"
      },
      "type": "characterCore",
      "measured": {
        "width": 336,
        "height": 244
      },
      "position": {
        "x": 40,
        "y": 480
      }
    },
    {
      "id": "node-actor-dr. maya lin",
      "data": {
        "actorName": "Rebecca Hall meets Carrie-Anne Moss",
        "vocalWeight": "Hyper-articulate, brisk, mathematically precise, concealing profound existential desperation behind empirical detachment.",
        "energyProfile": "The Obsessive Visionary",
        "roleReference": "Psychological Cadence Profile (Hyper-articulate, brisk, mathematically precise, concealing profound existential desperation behind empirical detachment.)",
        "imageUrl": "/cinema/characters/maya_portrait.jpg"
      },
      "type": "actor",
      "measured": {
        "width": 320,
        "height": 308
      },
      "position": {
        "x": -380,
        "y": 1020
      }
    },
    {
      "id": "node-dial-dr. maya lin",
      "data": {
        "speed": 75,
        "subtext": 85,
        "confidence": 90,
        "presetName": "Dr. Maya Lin Behavioral Dial"
      },
      "type": "personality",
      "measured": {
        "width": 320,
        "height": 234
      },
      "position": {
        "x": -380,
        "y": 1200
      }
    },
    {
      "id": "node-quirks-dr. maya lin",
      "data": {
        "tics": [
          "Subtext ratio: 90%",
          "Avoids direct answers when pressed on motives"
        ]
      },
      "type": "quirks",
      "measured": {
        "width": 320,
        "height": 165
      },
      "position": {
        "x": -380,
        "y": 1380
      }
    },
    {
      "id": "node-core-dr. maya lin",
      "data": {
        "name": "Dr. Maya Lin",
        "actorComp": "Rebecca Hall meets Carrie-Anne Moss",
        "archetype": "The Obsessive Visionary",
        "objective": "Collect the singularity's core quantum equations at any relativistic cost, believing it is Earth's only mathematical salvation.",
        "dialsSummary": "Intellect 98% · Obsession 92% · Deception 75%"
      },
      "type": "characterCore",
      "measured": {
        "width": 336,
        "height": 244
      },
      "position": {
        "x": 40,
        "y": 1060
      }
    },
    {
      "id": "node-actor-aura-9",
      "data": {
        "actorName": "Tilda Swinton (Synthesized Vocal Architecture)",
        "vocalWeight": "Monotone, synthetically serene, relentlessly literal, speaking in temporal probabilities and countdowns.",
        "energyProfile": "The Quantum Oracle AI",
        "roleReference": "Psychological Cadence Profile (Monotone, synthetically serene, relentlessly literal, speaking in temporal probabilities and countdowns.)",
        "imageUrl": "/cinema/characters/aura_portrait.jpg"
      },
      "type": "actor",
      "measured": {
        "width": 320,
        "height": 293
      },
      "position": {
        "x": -380,
        "y": 1600
      }
    },
    {
      "id": "node-dial-aura-9",
      "data": {
        "speed": 75,
        "subtext": 85,
        "confidence": 90,
        "presetName": "AURA-9 Behavioral Dial"
      },
      "type": "personality",
      "measured": {
        "width": 320,
        "height": 234
      },
      "position": {
        "x": -380,
        "y": 1780
      }
    },
    {
      "id": "node-quirks-aura-9",
      "data": {
        "tics": [
          "Subtext ratio: 40%",
          "Avoids direct answers when pressed on motives"
        ]
      },
      "type": "quirks",
      "measured": {
        "width": 320,
        "height": 165
      },
      "position": {
        "x": -380,
        "y": 1960
      }
    },
    {
      "id": "node-core-aura-9",
      "data": {
        "name": "AURA-9",
        "actorComp": "Tilda Swinton (Synthesized Vocal Architecture)",
        "archetype": "The Quantum Oracle AI",
        "objective": "Maintain mission integrity and trajectory convergence according to immutable relativistic mechanics.",
        "dialsSummary": "Logic 100% · Empathy 0% · Fatalism 95%"
      },
      "type": "characterCore",
      "measured": {
        "width": 336,
        "height": 230
      },
      "position": {
        "x": 40,
        "y": 1640
      }
    },
    {
      "id": "node-chemistry-1",
      "data": {
        "scenario": "Julian Ross and Dr. Maya Lin trapped together with a ticking deadline"
      },
      "type": "chemistry",
      "measured": {
        "width": 320,
        "height": 213
      },
      "position": {
        "x": 480,
        "y": 800
      }
    },
    {
      "id": "node-scene-1",
      "data": {
        "state": "ready",
        "title": "The Accretion Threshold",
        "stakes": "Julian and Maya initiate the perilous gravity slingshot burn around the micro-singularity. The terrifying scale of relativistic time dilation is established just as an impossible telemetry echo registers on long-range sonar.",
        "slugline": "INT. CHRONOS - FLIGHT COCKPIT - RELATIVISTIC ZERO HOUR",
        "hasStyleRef": true,
        "characterCount": 3
      },
      "type": "scene",
      "measured": {
        "width": 320,
        "height": 237
      },
      "position": {
        "x": 480,
        "y": 80
      }
    },
    {
      "id": "node-script-1",
      "data": {
        "title": "Aethelgard: The Chronos Shift Script Draft",
        "wordCount": 322,
        "previewText": "INT. CHRONOS - FLIGHT COCKPIT - RELATIVISTIC ZERO HOUR\n\nStrobe-cyan emergency luminescence cuts through pressurized atmospheric mist. Beyond the triple-reinforced quartz canopy lies the Abyss: an ink-black sphere wrapped in a blinding, spinning ribbon of hyper-accelerated amber plasma.\n\nThe gravity well groans through the titanium hull—a low, visceral sub-bass vibration that resonates directly in the teeth.\n\nJULIAN ROSS (50s, hollow-eyed, veins stark against pale temples) grips the primary twin-axis thruster yoke. Knuckles white.\n\nA holographic chrono-counter floats before him, ticking down: 00:09:59... 00:09:58...\n\nJULIAN\nInertial dampeners at ninety-one percent. We are crossing the ergosphere boundary.\n\nDR. MAYA LIN (30s, sharp features, eyes reflecting the furious accretion disc) rapidly taps an illuminated glass console. Her breathing is controlled, almost reverent.\n\nMAYA\nGravitational shear is within three sigma. Keep the nose pitched four degrees off the photon ring, Julian. If we slip into the photon sphere, our orbital velocity becomes infinite.\n\nAURA-9 (V.O.)\nRelativistic slip engaged. Local frame rate: one second per Chronos equals one hundred and fifty-seven Earth days. Current voyage cost: two years, eleven months, four days.\n\nJulian's jaw clenches. A vein throbs in his neck.\n\nJULIAN\nEvery breath in this chair is a season on Earth. Maya, tell me your sensor array is actually drinking something useful.\n\nMAYA\n(without looking up)\nThe magnetic flux data is streaming. If we maintain this arc for three hundred seconds, we have the planetary core restoration model.\n\nA sharp, synthetic CHIME breaks the hum. A high-frequency distress tone pulses from the central telemetry HUD. Erratic. Piercing.\n\nJULIAN\n(frowning)\nAURA. Filter that. What is pinging an emergency transponder in an uncharted singularity orbit?\n\nAURA-9 (V.O.)\nSignal detected on narrow-band subspace 14.8 GHz. Encrypted with United Earth Stellar Command telemetry protocols.\n\nMAYA\n(freezes, eyes narrowing)\nThat's impossible. We are the first deep-recon hull cleared for the Saturnian gravity well.\n\nJULIAN\nIdentify the transponder registry.\n\nAURA-9 (V.O.)\nSignal source is designated: Deep Recon Vessel Chronos. Black-Box Beacon Zero-One."
      },
      "type": "script",
      "measured": {
        "width": 320,
        "height": 216
      },
      "position": {
        "x": 920,
        "y": 80
      }
    },
    {
      "id": "node-storyboard-1",
      "data": {
        "prompt": "2.39:1 low-angle cinematic anamorphic frame: Julian Ross confronts Dr. Maya Lin; volumetric lighting and atmospheric tension.",
        "imageUrl": "/cinema/scenes/scene_1_storyboard_accretion.jpg",
        "lighting": "High-contrast vacuum strobes, amber warning halos, atmospheric haze",
        "shotType": "2.39:1 Anamorphic Scope"
      },
      "type": "storyboard",
      "measured": {
        "width": 320,
        "height": 279
      },
      "position": {
        "x": 1360,
        "y": -80
      },
      "selected": false
    },
    {
      "id": "node-floorplan-1",
      "data": {
        "sceneTitle": "The Accretion Threshold",
        "cameraCount": 3
      },
      "type": "floorplan",
      "measured": {
        "width": 320,
        "height": 345
      },
      "position": {
        "x": 1360,
        "y": 160
      }
    },
    {
      "id": "node-tension-1",
      "data": {
        "hasWarning": false,
        "peakTension": 88
      },
      "type": "tensionCurve",
      "measured": {
        "width": 320,
        "height": 284
      },
      "position": {
        "x": 1360,
        "y": 380
      }
    },
    {
      "id": "node-tableread-1",
      "data": {
        "voiceCount": 3
      },
      "type": "tableRead",
      "measured": {
        "width": 320,
        "height": 258
      },
      "position": {
        "x": 1360,
        "y": 600
      }
    },
    {
      "id": "node-market-1",
      "data": {},
      "type": "market",
      "measured": {
        "width": 320,
        "height": 209
      },
      "position": {
        "x": 1360,
        "y": 820
      }
    },
    {
      "id": "node-floorplan-mttgt3gb",
      "data": {
        "sceneTitle": "Echoes in the Redshift",
        "cameraCount": 3
      },
      "type": "floorplan",
      "position": {
        "x": 277,
        "y": 277
      }
    }
  ],
  "edges": [
    {
      "id": "e-act-julian ross",
      "source": "node-actor-julian ross",
      "target": "node-core-julian ross",
      "targetHandle": "actor_ref"
    },
    {
      "id": "e-dial-julian ross",
      "source": "node-dial-julian ross",
      "target": "node-core-julian ross",
      "targetHandle": "personality"
    },
    {
      "id": "e-quirk-julian ross",
      "source": "node-quirks-julian ross",
      "target": "node-core-julian ross",
      "targetHandle": "quirks"
    },
    {
      "id": "e-char-scene-julian ross",
      "source": "node-core-julian ross",
      "target": "node-scene-1",
      "targetHandle": "character_in"
    },
    {
      "id": "e-act-dr. maya lin",
      "source": "node-actor-dr. maya lin",
      "target": "node-core-dr. maya lin",
      "targetHandle": "actor_ref"
    },
    {
      "id": "e-dial-dr. maya lin",
      "source": "node-dial-dr. maya lin",
      "target": "node-core-dr. maya lin",
      "targetHandle": "personality"
    },
    {
      "id": "e-quirk-dr. maya lin",
      "source": "node-quirks-dr. maya lin",
      "target": "node-core-dr. maya lin",
      "targetHandle": "quirks"
    },
    {
      "id": "e-char-scene-dr. maya lin",
      "source": "node-core-dr. maya lin",
      "target": "node-scene-1",
      "targetHandle": "character_in"
    },
    {
      "id": "e-act-aura-9",
      "source": "node-actor-aura-9",
      "target": "node-core-aura-9",
      "targetHandle": "actor_ref"
    },
    {
      "id": "e-dial-aura-9",
      "source": "node-dial-aura-9",
      "target": "node-core-aura-9",
      "targetHandle": "personality"
    },
    {
      "id": "e-quirk-aura-9",
      "source": "node-quirks-aura-9",
      "target": "node-core-aura-9",
      "targetHandle": "quirks"
    },
    {
      "id": "e-char-scene-aura-9",
      "source": "node-core-aura-9",
      "target": "node-scene-1",
      "targetHandle": "character_in"
    },
    {
      "id": "e-chem-a",
      "source": "node-core-julian ross",
      "target": "node-chemistry-1",
      "targetHandle": "char_a"
    },
    {
      "id": "e-chem-b",
      "source": "node-core-dr. maya lin",
      "target": "node-chemistry-1",
      "targetHandle": "char_b"
    },
    {
      "id": "e-clip-scene",
      "source": "node-clip-1",
      "target": "node-scene-1",
      "targetHandle": "style_ref"
    },
    {
      "id": "e-note-scene",
      "source": "node-note-1",
      "target": "node-scene-1",
      "targetHandle": "plot_seed"
    },
    {
      "id": "e-scene-script",
      "source": "node-scene-1",
      "target": "node-script-1",
      "targetHandle": "script_in"
    },
    {
      "id": "e-script-storyboard",
      "source": "node-script-1",
      "target": "node-storyboard-1",
      "targetHandle": "script_in"
    },
    {
      "id": "e-script-floorplan",
      "source": "node-script-1",
      "target": "node-floorplan-1",
      "targetHandle": "script_in"
    },
    {
      "id": "e-script-tension",
      "source": "node-script-1",
      "target": "node-tension-1",
      "targetHandle": "script_in"
    },
    {
      "id": "e-script-tableread",
      "source": "node-script-1",
      "target": "node-tableread-1",
      "targetHandle": "script_in"
    },
    {
      "id": "e-script-market",
      "source": "node-script-1",
      "target": "node-market-1",
      "targetHandle": "script_in"
    }
  ],
  "videoTakes": [
    {
      "id": "take-veo-chronos-01",
      "takeNumber": 1,
      "title": "Accretion Ergosphere Crossing (Master Plate)",
      "cameraMotion": "35mm Anamorphic Slow Creep-In from Low Pitch Angle",
      "stylePreset": "70mm IMAX Practical Sci-Fi",
      "durationSec": 5,
      "createdAt": 1788919575000,
      "videoUrl": "/cinema/videos/chronos_take_01.mp4",
      "prompt": "Cinematic 35mm anamorphic shot from cockpit of spacecraft Chronos approaching spinning amber plasma accretion disc of micro-singularity. Strobe cyan warnings, volumetric light rays, tactile analog avionics switches, zero gravity dust motes.",
      "characterName": "Julian Ross",
      "isMaster": true
    },
    {
      "id": "take-veo-chronos-02",
      "takeNumber": 2,
      "title": "Cockpit Perigee High-G Vector Burn",
      "cameraMotion": "Hydraulic Jitter with Technocrane Axis Pan",
      "stylePreset": "Christopher Nolan Anamorphic Scope",
      "durationSec": 5,
      "createdAt": 1788919924000,
      "videoUrl": "/cinema/videos/chronos_take_02.mp4",
      "prompt": "Extreme high-tension cockpit camera lurch as plasma flame reflects on cracked canopy glass. Julian Ross and Dr. Maya Lin strapped into acceleration couches fighting 9-G deceleration forces.",
      "characterName": "Dr. Maya Lin",
      "isMaster": false
    }
  ],
  "activeVideoUrl": "/cinema/videos/chronos_take_01.mp4",
  "scoreTakes": [
    {
      "id": "score-chronos-01",
      "sceneId": "scene-chronos-1",
      "takeNumber": 1,
      "title": "Singularity Ergosphere Slingshot Theme",
      "prompt": "Duration: Exactly 30 seconds with a clean, resolved ending. Cinematic original score for a dramatic Cosmic Sci-Fi / Space Opera. Tense ticking acoustic pulses, low pipe organ drone, escalating into sweeping brass climax as the ship rounds the black hole.",
      "durationMode": "clip",
      "durationSec": 30,
      "createdAt": 1788920005000,
      "audioUrl": "/cinema/audio/chronos_score_01.mp3",
      "isMaster": true,
      "scoreType": "score",
      "instruments": [
        "Pipe Organ",
        "Low Cello Ostinato",
        "Tactile Ticking Chronometer",
        "Sub-bass Brass Sforzando"
      ],
      "dynamicArc": "Slow atmospheric dread building to heart-stopping brass crescendo"
    },
    {
      "id": "score-chronos-02",
      "sceneId": "scene-chronos-2",
      "takeNumber": 2,
      "title": "Temporal Echo Paradox Ambient Suite",
      "prompt": "Haunting dissonant strings with tape-loop delay and filtered vocal telemetry flutter. Cold acoustic isolation of deep space.",
      "durationMode": "clip",
      "durationSec": 30,
      "createdAt": 1788919675000,
      "audioUrl": "/cinema/audio/chronos_score_02.mp3",
      "isMaster": false,
      "scoreType": "score",
      "instruments": [
        "Prepared Piano",
        "Analog Tape Loop",
        "Bowed Glass",
        "Harmonic Waterphone"
      ],
      "dynamicArc": "Chilling contemplative stillness"
    }
  ],
  "activeScoreUrl": "/cinema/audio/chronos_score_01.mp3",
  "locationClusters": [
    {
      "name": "Arleta Sci-Fi Soundstage Campus (Scenes 1, 2, 3, & 4)",
      "notes": "Consolidating all 4 scenes across Laurel Canyon Stages' standing spaceship cockpit, adjoining corridors, and observation deck modules eliminates 3 full company moves, reduces FilmLA municipal permit application overhead to a single base filing with simple daily riders, and keeps total location expenditure under $23,000 against a combined $127,500 location budget.",
      "region": "Arleta / San Fernando Valley, Los Angeles, CA",
      "category": "studio-backlot",
      "scene_ids": [
        "scene-gen-1788918946951-1",
        "scene-gen-1788918946951-2",
        "scene-gen-1788918946951-3",
        "scene-gen-1788918946951-4"
      ],
      "cluster_id": "cluster-01-laurel-canyon",
      "candidate_id": "loc_01_laurel_canyon",
      "estimated_savings": "$18,500 in eliminated truck transit, crew travel time, generator rentals, and redundant permit application fees"
    },
    {
      "name": "Burbank Virtual Production Hub (Scenes 1, 2, 3, & 4)",
      "notes": "Executing the entire 4-scene singularity sequence on L.A. Castle Studios' Unreal Engine LED volume stage allows the production to capture all in-camera relativistic visual effects, lighting shifts, and singularity redshift reflections in real time, dramatically compressing the VFX turnaround window.",
      "region": "Burbank, CA",
      "category": "studio-backlot",
      "scene_ids": [
        "scene-gen-1788918946951-1",
        "scene-gen-1788918946951-2",
        "scene-gen-1788918946951-3",
        "scene-gen-1788918946951-4"
      ],
      "cluster_id": "cluster-02-burbank-virtual-volume",
      "candidate_id": "loc_01_la_castle",
      "estimated_savings": "$35,000+ in post-production visual effects compositing, green-screen cleanup, and multi-location move overhead"
    },
    {
      "name": "Fonco Modular Spacecraft Hub (Scenes 1, 2, 3, & 4)",
      "notes": "Utilizing Fonco Studios' modular spaceship standing sets and adjacent insert stage allows the production to shoot the entire script slate under $17,000 total location spend while maintaining immediate access to on-site fabrication shops for custom telemetry and override props.",
      "region": "Glassell Park / Los Angeles, CA",
      "category": "studio-backlot",
      "scene_ids": [
        "scene-gen-1788918946951-1",
        "scene-gen-1788918946951-2",
        "scene-gen-1788918946951-3",
        "scene-gen-1788918946951-4"
      ],
      "cluster_id": "cluster-03-glassell-park-fonco",
      "candidate_id": "loc_01_fonco",
      "estimated_savings": "$22,000 in location rental savings and eliminated logistical company moves"
    }
  ],
  "initialEvents": [],
  "isCustom": false,
  "isStarred": true,
  "storyboardFrameUrl": "/cinema/scenes/scene_1_storyboard_accretion.jpg",
  "floorPlanMapUrl": "/cinema/maps/cockpit_deck_plan.png",
  "floorPlanMapName": "Chronos Cockpit Tactical Deck Plan",
  "seedVersion": 2,
  "createdAt": 1788918946958,
  "updatedAt": 1788920048317
};

export const DEFAULT_SEED_PROJECTS: ProjectData[] = [
  AETHELGARD_DEMO_PROJECT,
];


