import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  MessageSquare,
  CheckCircle,
  Clock,
  BarChart,
  Plus,
  MoreHorizontal,
  Twitter,
  Linkedin,
  Instagram,
  Copy,
  ExternalLink,
  Trash2,
  Filter,
  Sparkles,
  Wand2,
  Loader2,
  UserCheck,
  Wifi,
  WifiOff,
  Lock,
  LogOut,
  KeyRound,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  getDoc,
} from "firebase/firestore";

// --- Constants ---
const CALENDLY_LINK =
  "https://calendly.com/thegoatshowpod/interview?month=2026-02";
const RECORDING_LINK = "https://streamyard.com/guest/invite-link";
const EPISODE_LINK = "https://youtube.com/@thegoatshowpod";
const DEFAULT_PASSWORD = "abc123";
const APP_USERS = ["Fresh", "Deezy", "Zilly"];

// --- API KEYS ---
// TODO: PASTE YOUR GEMINI API KEY BELOW FOR AI FEATURES TO WORK
const GEMINI_API_KEY = "AIzaSyDa97tffoKTqv5lLROCWAczncvf4zSAy1I";

// --- Firebase Configuration ---
// Your specific keys are already filled in here.
const firebaseConfig = {
  apiKey: "AIzaSyAUxaU-n1-SLuP5X6jC6Zl17zj7GQJm0Fs",
  authDomain: "the-goat-show-crm.firebaseapp.com",
  projectId: "the-goat-show-crm",
  storageBucket: "the-goat-show-crm.firebasestorage.app",
  messagingSenderId: "617967548832",
  appId: "1:617967548832:web:f9de913caa12d35cdb8cc5",
  measurementId: "G-M109RQFWNS",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "the-goat-show-crm"; // Hardcoded for your live app

// --- Mock Data ---
const MOCK_INFLUENCERS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    handle: "@sarahj_tech",
    platform: "Twitter",
    followers: "45K",
    niche: "Tech Journalism",
    status: "New",
  },
  {
    id: 2,
    name: "David Chen",
    handle: "@dchen_vc",
    platform: "LinkedIn",
    followers: "120K",
    niche: "Venture Capital",
    status: "New",
  },
  {
    id: 3,
    name: "Elena Ross",
    handle: "@elena.designs",
    platform: "Instagram",
    followers: "85K",
    niche: "UX Design",
    status: "New",
  },
  {
    id: 4,
    name: "Marcus Strom",
    handle: "@marcus_crypto",
    platform: "Twitter",
    followers: "210K",
    niche: "Web3",
    status: "New",
  },
  {
    id: 5,
    name: "Dr. A. Patel",
    handle: "@apatel_ai",
    platform: "LinkedIn",
    followers: "60K",
    niche: "AI Research",
    status: "New",
  },
];

const TEMPLATES = [
  {
    id: 1,
    name: "The GOAT Show (Invite)",
    subject: "Invitation: The GOAT Show Podcast 🐐",
    body: `Hey [Guest Name],

Hope you're well. I'm [Your Name], one of the hosts of The GOAT Show Podcast, and we’re big fans of your work.

Our show’s mission is to "celebrate and debate all things great," and we would love to have you on for an interview. Just to be clear, there are no "gotchas" here. We’re looking for an honest conversation about your life, your journey into [Guest's Niche/Background], your [Specific Career Highlight], and anything else you’re currently working on that you'd like to highlight.

I’ve attached my Calendly link below, feel free to book a slot that fits your schedule. If none of those times work, just let me know and I’ll coordinate with my co-hosts to make something work for you.

[Calendly Link]

Thanks for the consideration. God bless!`,
  },
  {
    id: 4,
    name: "Follow-Up: Circle Back",
    subject: "Re: Invitation: The GOAT Show Podcast 🐐",
    body: `Hey [Guest Name],

Just wanted to circle back on this and make sure it didn't get buried in your inbox.

We’re still really stoked about the idea of having you on The GOAT Show. We’d love to give you the platform to share your story and dive into [Specific Topic] with the audience.

If you’re interested but the Calendly times don't align with your schedule, just shoot me a reply and we'll move things around on our end to make it easy for you.

[Calendly Link]

Either way, keep up the great work!

God bless,
[Your Name]`,
  },
  {
    id: 5,
    name: "Guest Prep Sheet",
    subject: "Guest Prep: Your Visit to The GOAT Show 🐐",
    body: `We’re looking forward to having you on the show! To make sure we get the best possible recording and keep things moving smoothly, here’s a quick checklist of what you’ll need on the day:

Camera: We record video for our social clips and YouTube, so please use the best webcam or external camera you have available.
Headphones: To prevent echo and keep the audio crisp, please wear a pair of headphones (even simple earbuds work great).
Solid Internet: A stable connection is key. If you can be close to your router or plugged into ethernet, even better.
A Drink for the Toast: At the end of every episode, we like to raise a glass and toast our guests. Have your favorite beverage (water, coffee, bourbon—whatever you like!) ready to go so we can close out the show properly.

The Logistics:
We’ll be using Streamyard for recording the interview. You will need to click the link below 15 minutes before the interview time.

[Link to Recording Room]

That’s it! No scripts, no "gotchas"—just a great conversation. See you soon!`,
  },
  {
    id: 6,
    name: "Post-Interview: Episode Live",
    subject: "You’re live on The GOAT Show! 🐐",
    body: `Hey [Guest Name],

The episode is officially live! I really enjoyed our conversation—that part where we touched on [mention a specific moment or insight from the show] was a huge highlight for us.

You can check out the full episode here:
[Link to YouTube/Spotify/Apple]

I’ve also attached a few clips and graphics from the episode that are ready for social media if you’d like to share them with your audience. If you do post, feel free to tag us so we can jump in the comments and support!

Thanks again for being so open and for joining us on the show. Truly a "GOAT" performance.

God bless,
[Your Name]`,
  },
];

// --- Utility Components & Functions ---

const handleCopy = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

const Badge = ({ children, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[color] || colors.gray
      }`}
    >
      {children}
    </span>
  );
};

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
  >
    {children}
  </div>
);

// --- Auth Views ---

const LoginView = ({ onLogin, loading }) => {
  const [username, setUsername] = useState(APP_USERS[0]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    onLogin(username, password).catch((err) => setError(err.message));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            The GOAT Show Access
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your host credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Host Name
            </label>
            <select
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {APP_USERS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
          </button>
        </form>
      </Card>
    </div>
  );
};

const ChangePasswordView = ({ username, onChangePassword, loading }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password too short");
      return;
    }
    onChangePassword(newPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Setup New Password
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Welcome, {username}. Please set a secure password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Set Password & Login"
            )}
          </button>
        </form>
      </Card>
    </div>
  );
};

// --- Sub-Views ---

const DashboardView = ({ contacts, setActiveTab }) => {
  const stats = [
    {
      label: "Total Candidates",
      value: contacts.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Outreach",
      value: contacts.filter((c) => c.status === "To Contact").length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "Interviews Booked",
      value: contacts.filter((c) => c.status === "Booked").length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Response Rate",
      value: "12%",
      icon: BarChart,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Recent Activity
            </h3>
            {contacts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No activity yet. Start by finding candidates.</p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                >
                  Go to Search
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.slice(0, 5).map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {contact.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {contact.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added {contact.dateAdded}
                        </p>
                      </div>
                    </div>
                    <Badge
                      color={
                        contact.status === "Booked"
                          ? "green"
                          : contact.status === "To Contact"
                          ? "yellow"
                          : "blue"
                      }
                    >
                      {contact.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveTab("search")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center">
                  <Search className="w-4 h-4 mr-2" /> Find Candidates
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setActiveTab("pipeline")}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" /> Draft Message
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Platform Status
              </h4>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="flex items-center text-gray-600">
                  <Twitter className="w-4 h-4 mr-2 text-blue-400" /> Twitter API
                </span>
                <span className="text-green-500 text-xs font-medium">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center text-gray-600">
                  <Linkedin className="w-4 h-4 mr-2 text-blue-700" /> LinkedIn
                </span>
                <span className="text-yellow-500 text-xs font-medium">
                  Manual Mode
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const SearchView = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  contacts,
  addToPipeline,
  findCandidatesWithGemini,
  isSearchingAI,
}) => {
  return (
    <div className="animate-in fade-in duration-500">
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by niche, keyword, or name..."
              className="w-full pl-10 pr-32 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  findCandidatesWithGemini();
                }
              }}
            />
            <div className="absolute right-1 top-1 bottom-1">
              <button
                onClick={findCandidatesWithGemini}
                disabled={isSearchingAI || !searchQuery}
                className="h-full px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium flex items-center transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearchingAI ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin mr-1" />{" "}
                    Scouting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" /> AI Scout
                  </>
                )}
              </button>
            </div>
          </div>
          <button className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
            <Filter className="w-4 h-4 mr-2" /> Filters
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>
              No candidates found. Try searching for a niche like "SaaS" or
              "Crypto" and use the AI Scout.
            </p>
          </div>
        ) : (
          searchResults.map((person) => {
            // Check based on handle because ID from search might be numeric vs string in Firestore
            const isAdded = contacts.find((c) => c.handle === person.handle);
            return (
              <Card
                key={person.id}
                className="relative group hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 text-lg font-bold">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{person.name}</h3>
                      <p className="text-sm text-gray-500">{person.handle}</p>
                    </div>
                  </div>
                  {person.platform === "Twitter" && (
                    <Twitter className="w-5 h-5 text-blue-400" />
                  )}
                  {person.platform === "LinkedIn" && (
                    <Linkedin className="w-5 h-5 text-blue-700" />
                  )}
                  {person.platform === "Instagram" && (
                    <Instagram className="w-5 h-5 text-pink-600" />
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Followers</span>
                    <span className="font-medium text-gray-900">
                      {person.followers}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Niche</span>
                    <Badge color="blue">{person.niche}</Badge>
                  </div>
                </div>

                <button
                  onClick={() => addToPipeline(person)}
                  disabled={isAdded}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                    isAdded
                      ? "bg-green-50 text-green-700 cursor-default"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" /> Added to Pipeline
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" /> Add to Pipeline
                    </>
                  )}
                </button>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

const PipelineView = ({
  contacts,
  selectedContact,
  setSelectedContact,
  currentUser,
  aiMessage,
  setAiMessage,
  isGenerating,
  generateWithGemini,
  selectedTemplate,
  setSelectedTemplate,
  updateStatus,
  removeContact,
}) => {
  const statuses = ["To Contact", "Contacted", "In Discussion", "Booked"];

  const renderMessageBuilder = () => {
    if (!selectedContact)
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
          <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
          <p>Select a contact to generate a personalized message.</p>
        </div>
      );

    // Robust substitution for the "static" (non-AI) view
    const templatePreview = selectedTemplate.body
      .replace("[Guest Name]", selectedContact.name.split(" ")[0])
      .replace("[Your Name]", currentUser)
      .replace("[Guest's Niche/Background]", selectedContact.niche)
      .replace("[Specific Career Highlight]", "recent work") // Generic fallback
      .replace("[Specific Topic]", `${selectedContact.niche} trends`) // Fallback for Follow-up
      .replace(
        "[mention a specific moment or insight from the show]",
        `your insights on ${selectedContact.niche}`
      ) // Fallback for Post-interview
      .replace("[Calendly Link]", CALENDLY_LINK)
      .replace("[Link to Recording Room]", RECORDING_LINK)
      .replace("[Link to YouTube/Spotify/Apple]", EPISODE_LINK);

    const finalBody = aiMessage || templatePreview;

    return (
      <div className="h-full flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Message {selectedContact.name}
            </h3>
            <p className="text-sm text-gray-500">
              Via {selectedContact.platform} DM
            </p>
          </div>
          <button
            onClick={() => setSelectedContact(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 flex-1">
          {/* AI Controls */}
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-800 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> AI ASSISTANT
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                onClick={() => generateWithGemini("personalize")}
                disabled={isGenerating}
                className="bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 text-xs py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center shadow-sm"
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <UserCheck className="w-3 h-3 mr-1" />
                )}
                Personalize Template
              </button>
              <button
                onClick={() =>
                  generateWithGemini("rewrite", "more casual and witty")
                }
                disabled={isGenerating}
                className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 text-xs py-2 px-3 rounded-md font-medium transition-colors"
              >
                Make Witty
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  generateWithGemini("rewrite", "shorter (under 140 chars)")
                }
                disabled={isGenerating}
                className="bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 text-xs py-2 px-3 rounded-md font-medium transition-colors"
              >
                Shorten
              </button>
              <button
                onClick={() => generateWithGemini("draft")}
                disabled={isGenerating}
                className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 text-xs py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center"
              >
                New Draft
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
              Or Choose Template
            </label>
            <div className="grid grid-cols-1 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTemplate(t);
                    setAiMessage("");
                  }}
                  className={`text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                    selectedTemplate.id === t.id && !aiMessage
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-300 shadow-sm relative">
            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
                  <span className="text-xs font-medium text-indigo-600">
                    Writing...
                  </span>
                </div>
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-500">
                PREVIEW
              </span>
              <button
                onClick={() => handleCopy(finalBody)}
                className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center"
              >
                <Copy className="w-3 h-3 mr-1" /> Copy Text
              </button>
            </div>
            <textarea
              className="w-full h-48 text-gray-800 text-sm whitespace-pre-wrap leading-relaxed resize-none focus:outline-none"
              value={finalBody}
              onChange={(e) => setAiMessage(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <button
              onClick={() => {
                updateStatus(selectedContact.id, "Contacted");
                setSelectedContact(null);
              }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors"
            >
              Mark as Contacted
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Contact List */}
      <div className="lg:col-span-2 overflow-y-auto pr-2">
        <Card className="h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Contacts</h2>
            <div className="flex space-x-2">
              {statuses.map((s) => (
                <div key={s} className="flex items-center text-xs">
                  <div
                    className={`w-2 h-2 rounded-full mr-1 ${
                      s === "To Contact"
                        ? "bg-yellow-400"
                        : s === "Contacted"
                        ? "bg-blue-400"
                        : s === "Booked"
                        ? "bg-green-400"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-gray-600 hidden sm:inline">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {contacts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No contacts in pipeline.
              </p>
              <p className="text-gray-400 text-sm">
                Go to Search to find people.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`group flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedContact?.id === contact.id
                      ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500"
                      : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-700 shadow-sm">
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{contact.name}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-2">
                        <span>{contact.niche}</span>
                        <span>•</span>
                        <span className="flex items-center">
                          {contact.platform === "Twitter" && (
                            <Twitter className="w-3 h-3 mr-1 text-blue-400" />
                          )}
                          {contact.platform === "LinkedIn" && (
                            <Linkedin className="w-3 h-3 mr-1 text-blue-700" />
                          )}
                          {contact.handle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => updateStatus(contact.id, e.target.value)}
                      value={contact.status}
                      className="bg-white border border-gray-200 text-xs rounded-md px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeContact(contact.id);
                      }}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Message Builder Side Panel */}
      <div className="lg:col-span-1">
        <Card className="h-full sticky top-6">{renderMessageBuilder()}</Card>
      </div>
    </div>
  );
};

export default function App() {
  const [appUser, setAppUser] = useState(null); // The logical app user (Fresh, Deezy, etc.)
  const [viewState, setViewState] = useState("login"); // 'login', 'change-pass', 'app'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [contacts, setContacts] = useState([]);
  const [searchResults, setSearchResults] = useState(MOCK_INFLUENCERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [user, setUser] = useState(null); // Firebase auth user
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // AI State
  const [aiMessage, setAiMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  // --- Auth & Data Sync ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth error", e);
        if (
          e.code === "auth/configuration-not-found" ||
          e.code === "auth/admin-restricted-operation" ||
          e.code === "auth/operation-not-allowed"
        ) {
          setAuthError(
            "Setup Required: Go to Firebase Console -> Build -> Authentication -> Sign-in method, and enable 'Anonymous'."
          );
        } else {
          setAuthError(`Connection Error: ${e.message}`);
        }
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Initialize App Users on mount if not exist
  useEffect(() => {
    if (!user) return;
    const initAppUsers = async () => {
      const usersRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "app_users"
      );
      // Simple check/create loop
      for (const name of APP_USERS) {
        const userDocRef = doc(usersRef, name);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
          await setDoc(userDocRef, {
            password: DEFAULT_PASSWORD,
            isFirstLogin: true,
          });
        }
      }
    };
    initAppUsers();
  }, [user]);

  // Sync Contacts
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "artifacts", appId, "public", "data", "contacts")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        data.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        setContacts(data);
      },
      (error) => {
        console.error("Data sync error:", error);
      }
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    setAiMessage("");
  }, [selectedContact]);

  // --- Auth Actions ---

  const handleLogin = async (username, password) => {
    setAuthLoading(true);
    try {
      const userDocRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "app_users",
        username
      );
      let docSnap = await getDoc(userDocRef);

      // AUTO-FIX: If user doesn't exist yet, create them right now
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          password: DEFAULT_PASSWORD,
          isFirstLogin: true,
        });
        docSnap = await getDoc(userDocRef); // Fetch again
      }

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.password === password) {
          if (userData.isFirstLogin) {
            setAppUser({ username, ...userData });
            setViewState("change-pass");
          } else {
            setAppUser({ username, ...userData });
            setViewState("app");
          }
        } else {
          throw new Error("Invalid password");
        }
      } else {
        throw new Error("User not initialized. Please refresh.");
      }
    } catch (e) {
      throw e;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleChangePassword = async (newPassword) => {
    setAuthLoading(true);
    try {
      const userDocRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "app_users",
        appUser.username
      );
      await updateDoc(userDocRef, {
        password: newPassword,
        isFirstLogin: false,
      });
      setAppUser((prev) => ({ ...prev, isFirstLogin: false }));
      setViewState("app");
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAppUser(null);
    setViewState("login");
  };

  // --- App Actions ---

  const findCandidatesWithGemini = async () => {
    if (!searchQuery) return;
    setIsSearchingAI(true);
    const apiKey = GEMINI_API_KEY;

    if (apiKey.includes("PASTE_YOUR_GEMINI_KEY_HERE")) {
      alert(
        "Please update the GEMINI_API_KEY in the code to use this feature."
      );
      setIsSearchingAI(false);
      return;
    }

    const prompt = `You are a talent scout for a podcast. Generate a JSON array of 5 realistic, high-quality guest candidates for a podcast about "${searchQuery}". 
    
    The output must be a valid JSON array of objects with these exact keys: 
    - "name" (Full name)
    - "handle" (Social media handle like @name)
    - "platform" (One of: Twitter, LinkedIn, Instagram)
    - "followers" (e.g. "45K", "120K")
    - "niche" (Short specific role/niche)
    
    Do not include markdown formatting or code blocks. Just the raw JSON array.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        const cleanText = text.replace(/```json|```/g, "").trim();
        const newCandidates = JSON.parse(cleanText).map((c) => ({
          ...c,
          id: Math.random(),
          status: "New",
        }));
        setSearchResults(newCandidates);
      }
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsSearchingAI(false);
    }
  };

  const generateWithGemini = async (type, extraContext = "") => {
    if (!selectedContact) return;
    setIsGenerating(true);
    const apiKey = GEMINI_API_KEY;

    if (apiKey.includes("PASTE_YOUR_GEMINI_KEY_HERE")) {
      alert(
        "Please update the GEMINI_API_KEY in the code to use this feature."
      );
      setIsGenerating(false);
      return;
    }

    let prompt = "";
    const currentText = aiMessage || selectedTemplate.body;

    if (type === "personalize") {
      prompt = `I have a podcast outreach template. I need you to fill in the specific placeholders for a contact named ${selectedContact.name} who is an expert in ${selectedContact.niche}. 
       
       Here is the template:
       "${currentText}"

       Instructions:
       1. Replace [Guest Name] with their first name.
       2. Replace [Your Name] with "${appUser?.username}".
       3. If present, replace [Guest's Niche/Background] with ${selectedContact.niche}.
       4. If present, replace [Specific Career Highlight] with a realistic, specific career achievement relevant to a ${selectedContact.niche} expert.
       5. If present, replace [Specific Topic] with a relevant, high-level discussion topic based on ${selectedContact.niche}.
       6. If present, replace [mention a specific moment or insight from the show] with a complimentary remark about their insight on ${selectedContact.niche}.
       7. Replace [Calendly Link] with "${CALENDLY_LINK}".
       8. Replace [Link to Recording Room] with "${RECORDING_LINK}".
       9. Replace [Link to YouTube/Spotify/Apple] with "${EPISODE_LINK}".
       10. Return ONLY the final message text.`;
    } else if (type === "draft") {
      prompt = `Write a completely new, short, high-conversion cold outreach DM to ${selectedContact.name}, who is a ${selectedContact.niche} influencer. 
      My goal is to invite them to 'The GOAT Show Podcast'. 
      Sign the message from "${appUser?.username}".
      Include this scheduling link: ${CALENDLY_LINK}.
      Keep it under 280 characters. Be specific to their niche.`;
    } else if (type === "rewrite") {
      prompt = `Rewrite the following message to be ${extraContext}. Keep the core request but change the tone/length. Ensure the sender remains "${appUser?.username}" and links remain. Message: "${currentText}"`;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setAiMessage(text.trim());
    } catch (error) {
      console.error("AI Error:", error);
      setAiMessage("Error connecting to AI. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addToPipeline = async (influencer) => {
    if (!user) return;
    if (contacts.find((c) => c.handle === influencer.handle)) return;

    try {
      await addDoc(
        collection(db, "artifacts", appId, "public", "data", "contacts"),
        {
          ...influencer,
          status: "To Contact",
          dateAdded: new Date().toLocaleDateString(),
          addedBy: appUser?.username,
        }
      );
    } catch (e) {
      console.error("Error adding contact", e);
    }
  };

  const updateStatus = async (id, newStatus) => {
    if (!user) return;
    try {
      await updateDoc(
        doc(db, "artifacts", appId, "public", "data", "contacts", id),
        {
          status: newStatus,
        }
      );
    } catch (e) {
      console.error("Error updating", e);
    }
  };

  const removeContact = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(
        doc(db, "artifacts", appId, "public", "data", "contacts", id)
      );
      if (selectedContact?.id === id) setSelectedContact(null);
    } catch (e) {
      console.error("Error deleting", e);
    }
  };

  // --- Render Logic ---

  if (viewState === "login") {
    return (
      <>
        {authError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 fixed top-0 left-0 right-0 z-50">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle
                  className="h-5 w-5 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-bold">{authError}</p>
              </div>
            </div>
          </div>
        )}
        <LoginView onLogin={handleLogin} loading={authLoading} />
      </>
    );
  }

  if (viewState === "change-pass") {
    return (
      <ChangePasswordView
        username={appUser?.username}
        onChangePassword={handleChangePassword}
        loading={authLoading}
      />
    );
  }

  // App View
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Users className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Outreach<span className="text-indigo-600">Pro</span>
          </span>
        </div>

        <div className="flex items-center space-x-1 md:space-x-4 bg-gray-100/50 p-1 rounded-lg">
          {["dashboard", "search", "pipeline"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <div
            className="hidden md:flex items-center space-x-1 mr-2"
            title={user ? "Cloud Sync Active" : "Connecting..."}
          >
            {user ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-300" />
            )}
          </div>

          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1 pr-1 border border-gray-200">
            <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {appUser?.username.charAt(0)}
            </div>
            <div className="flex flex-col mr-2">
              <span className="text-[10px] text-gray-500 font-bold leading-tight uppercase">
                Logged in as
              </span>
              <span className="text-sm font-bold text-gray-900">
                {appUser?.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-gray-200 rounded-md transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === "dashboard" && (
          <DashboardView contacts={contacts} setActiveTab={setActiveTab} />
        )}

        {activeTab === "search" && (
          <SearchView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            contacts={contacts}
            addToPipeline={addToPipeline}
            findCandidatesWithGemini={findCandidatesWithGemini}
            isSearchingAI={isSearchingAI}
          />
        )}

        {activeTab === "pipeline" && (
          <PipelineView
            contacts={contacts}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            currentUser={appUser?.username}
            aiMessage={aiMessage}
            setAiMessage={setAiMessage}
            isGenerating={isGenerating}
            generateWithGemini={generateWithGemini}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            updateStatus={updateStatus}
            removeContact={removeContact}
          />
        )}
      </main>
    </div>
  );
}
