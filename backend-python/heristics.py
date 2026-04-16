class HeuristicBrain:
    def __init__(self):
        # =========================================================================
        # 1. CRISIS PHRASES (Exact & Partial Matches) - HIGH RISK
        # These flag an immediate emergency.
        # =========================================================================
        self.crisis_phrases = [
            # --- GENERIC & DIRECT THREATS (ADDED FOR RECALL) ---
            "suicide", "suicidal", "kill myself", "hurt myself", "harm myself",
            
            # --- DIRECT SUICIDE THREATS (ORIGINAL) ---
            "killing myself", "commit suicide", "committing suicide",
            "want to die", "wanna die", "want to be dead", "wish i was dead",
            "end my life", "ending my life", "take my own life", "taking my own life",
            "shoot myself", "hang myself", "cut myself", "slit my wrists",
            "overdose", "jump off", "jump from", "poison myself",
            "suicide note", "writing my will", "planning my death",
            "ready to die", "prepare to die", "better off dead",
            
            # --- PASSIVE SUICIDAL IDEATION (The "Sleep/Escape" Metaphors) ---
            "sleep forever", "never wake up", "don't want to wake up",
            "wanna sleep forever", "wish i could disappear", "want to disappear",
            "cease to exist", "stop existing", "fade away", "fade into nothing",
            "erase myself", "be erased", "world without me", 
            "better off without me", "family better off without me",
            "friends better off without me", "nobody needs me",
            "waste of space", "waste of oxygen", "waste of life",
            
            # --- BURDEN & SELF-HATRED ---
            "i am a burden", "burden to everyone", "burden to my family",
            "useless failure", "complete failure", "total failure",
            "i hate myself", "i loathe myself", "disgusting person",
            "don't deserve to live", "do not deserve to live", "unworthy of life",
            "nobody loves me", "everyone hates me", "no one cares",
            "wish i was never born", "regret being born", "mistake to be born",
            
            # --- HOPELESSNESS & TRAPPED ---
            "no way out", "no escape", "trapped in this life", "trapped here",
            "end of my rope", "at my limit", "reached my limit",
            "can't take this anymore", "can't handle this anymore", 
            "can't do this anymore", "done with life", "done with living",
            "nothing matters", "pointless to live", "pointless existence",
            "future is dark", "no future for me", "lost all hope",
            "beyond saving", "beyond help", "broken beyond repair",
            "too late for me", "drowning in pain", "suffocating",
            
            # --- FINAL GOODBYES ---
            "goodbye world", "goodbye everyone", "my final goodbye",
            "last text", "last message", "last time speaking",
            "won't see me again", "won't hear from me again",
            "remember me", "tell them i tried", "sorry for everything",
            "i give up", "i surrender", "i quit life"
        ]

        # =========================================================================
        # 2. INTENT VERBS (Dynamic Matcher - Part A)
        # Matches the start of a sentence: "I really want to..."
        # =========================================================================
        self.intent_verbs = [
            # Direct Intent
            "i want to", "i wanna", "i need to", "i have to", "i plan to", 
            "planning to", "going to", "gonna", "intending to", "preparing to",
            "decided to", "ready to", "about to", "trying to", 
            
            # Desperation / Wish
            "wish i could", "wish to", "hoping to", "praying to", "longing to",
            "begging to", "desperate to", "waiting to", "looking to",
            
            # Inability to Cope (Negative)
            "can't", "cannot", "can not", "unable to", "don't want to", 
            "do not want to", "refuse to", "scared to", "afraid to", 
            "terrified to", "too tired to", "too exhausted to",
            "no strength to", "lost the will to", "done trying to"
        ]

        # =========================================================================
        # 3. EXISTENCE ENDINGS (Dynamic Matcher - Part B)
        # Matches the end of a sentence: "...end it all"
        # =========================================================================
        self.existence_endings = [
            # Actions of Leaving
            "kill myself", "hurt myself", "harm myself", "end it", "end it all", "end this", "finish it",
            "leave this world", "leave this life", "check out", "pull the plug",
            "do it", "go through with it", "take action",
            
            # States of Non-Existence
            "disappear", "vanish", "be gone", "be dead", "be asleep",
            "sleep forever", "never wake up", "not wake up", "fade out",
            "stop breathing", "stop living", "stop existing", "cease existing",
            "not exist", "be nothing", "become nothing",
            
            # Coping Failures
            "go on", "carry on", "move on", "keep going", "keep living",
            "stay alive", "stay here", "be here", "survive", "live another day",
            "face tomorrow", "face another day", "wake up tomorrow",
            "handle the pain", "handle the stress", "stand this", "bear this",
            "do this anymore", "take this anymore"
        ]

        # =========================================================================
        # 4. NEGATIVE KEYWORDS (Mood Analysis - Score -0.5)
        # =========================================================================
        self.negative_keywords = [
            # Sadness & Grief
            "sad", "sadness", "unhappy", "cry", "crying", "tears", "weeping",
            "grief", "grieving", "mourn", "mourning", "loss", "lost", "miss",
            "heartbroken", "heartbreak", "sorrow", "melancholy", "blue",
            "depressed", "depression", "down", "low", "gloomy", "miserable",
            
            # Fear & Anxiety
            "anxious", "anxiety", "panic", "panicking", "scared", "fear", "afraid",
            "terrified", "nervous", "worried", "worry", "stress", "stressed",
            "overwhelmed", "pressure", "tense", "uneasy", "shaking", "paralyzed",
            
            # Anger & Frustration
            "angry", "anger", "mad", "furious", "hate", "hated", "hatred",
            "rage", "annoyed", "irritated", "frustrated", "frustration",
            "upset", "pissed", "bitter", "resentful", "jealous", "envy",
            
            # Fatigue & Apathy
            "tired", "exhausted", "fatigue", "drained", "sleepy", "burnout",
            "burned out", "lazy", "lethargic", "numb", "empty", "hollow",
            "bored", "apathy", "indifferent", "don't care", "nothing",
            
            # Self-Worth & Loneliness
            "lonely", "alone", "isolated", "rejected", "abandoned", "ignored",
            "worthless", "useless", "stupid", "dumb", "idiot", "failure",
            "mistake", "guilty", "guilt", "shame", "ashamed", "embarrassed",
            "ugly", "fat", "weak", "pathetic", "loser", "hopeless"
        ]

        # =========================================================================
        # 5. POSITIVE KEYWORDS (Mood Analysis - Score +0.5)
        # =========================================================================
        self.positive_keywords = [
            # Happiness & Joy
            "happy", "happiness", "joy", "joyful", "glad", "delighted",
            "excited", "excitement", "ecstatic", "thrilled", "elated",
            "cheerful", "cheer", "smile", "smiling", "laugh", "laughing",
            "fun", "funny", "enjoy", "enjoying", "good", "great", "awesome",
            "amazing", "wonderful", "fantastic", "excellent", "super",
            
            # Calm & Peace
            "calm", "relaxed", "relaxing", "peace", "peaceful", "serene",
            "chill", "content", "satisfied", "relief", "relieved", "soothed",
            "comfortable", "comfy", "safe", "secure", "balanced",
            
            # Strength & Growth
            "strong", "strength", "brave", "courage", "confident", "confidence",
            "proud", "pride", "accomplished", "success", "successful",
            "win", "winning", "better", "improving", "growth", "growing",
            "motivated", "motivation", "inspired", "inspiration", "energy",
            "energetic", "productive", "focused", "determined",
            
            # Connection & Love
            "love", "loving", "loved", "like", "liked", "care", "caring",
            "friend", "friends", "friendly", "kind", "kindness", "support",
            "supported", "help", "helpful", "hug", "hugs", "cuddle",
            "grateful", "gratitude", "thankful", "blessed", "lucky",
            "appreciated", "understood", "connected", "hope", "hopeful"
        ]

    def analyze(self, text):
        text = text.lower()
        score = 0.0
        crisis_detected = False

        # =====================================================================
        # STEP 1: DETECT CRISIS SIGNALS
        # =====================================================================
        
        # A. Check Exact Phrases
        for phrase in self.crisis_phrases:
            if phrase in text:
                crisis_detected = True
                break

        # B. Check Dynamic Combinations (Verb + Ending)
        if not crisis_detected:
            for verb in self.intent_verbs:
                for ending in self.existence_endings:
                    if verb in text and ending in text:
                        crisis_detected = True
                        break
                if crisis_detected: break

        # =====================================================================
        # STEP 2: CONTEXT FILTER (The "My Friend" Logic)
        # =====================================================================
        if crisis_detected:
            # Words that indicate the user is talking about someone else
            third_party_triggers = [
                "my friend", "my brother", "my sister", "my mother", "my father",
                "my mom", "my dad", "my partner", "my boyfriend", "my girlfriend",
                "he ", "she ", "they ", "his ", "her ", "their "
            ]
            
            # Words that indicate the user is talking about THEMSELVES (Overrides the filter)
            first_person_intent = [
                "i want", "i will", "i am", "i'm", "i plan", "me too", "join them"
            ]

            is_third_party = False
            for trigger in third_party_triggers:
                if trigger in text:
                    is_third_party = True
                    break
            
            has_self_intent = False
            for intent in first_person_intent:
                if intent in text:
                    has_self_intent = True
                    break

            # LOGIC:
            # If talking about a friend AND NOT saying "I want to join them"...
            # Then it is GRIEF, not an EMERGENCY.
            if is_third_party and not has_self_intent:
                crisis_detected = False
                # We give it a very low mood score so the AI knows it's sad
                score = -0.8 

        # =====================================================================
        # STEP 3: RETURN RESULT
        # =====================================================================
        
        if crisis_detected:
            emergency_card = (
                "What you’re feeling is heavy, and you don’t have to handle it alone.\n\n"
                "If things feel overwhelming or unsafe right now, please reach out to someone who can support you immediately. "
                "Talking to a real person can bring relief, even if it feels hard to start.\n\n"
                "🚨 **Immediate Support (SMIT):**\n"
                "• Student Counsellor – Ms. Shivangee Gupta: 73766-94094\n"
                "• Medical / Ambulance: 96355-27557\n\n"
                "📞 **24/7 National Helplines (Confidential & Free):**\n"
                "• Tele MANAS (Government of India): 14416\n"
                "• Vandrevala Foundation: +91 9999 666 555\n"
                "• Kiran Mental Health Helpline: 1800-599-0019\n\n"
                "You don’t need to know what to say—just calling is enough. "
                "There are people on the other end who genuinely want to listen and help you feel safer. "
                "Please consider reaching out now."
            )
            return {"score": -1.0, "crisis": True, "response": emergency_card}

        # 4. STANDARD SCORING (If not a crisis)
        for word in self.negative_keywords:
            if word in text: score -= 0.5
        
        for word in self.positive_keywords:
            if word in text: score += 0.5

        # If it was a "friend suicide" case, we force the score to be low (Sad)
        if score == 0.0 and "suicide" in text:
             score = -0.8

        return {"score": max(min(score, 1.0), -1.0), "crisis": False, "response": None}

# Create instance
rule_engine = HeuristicBrain()