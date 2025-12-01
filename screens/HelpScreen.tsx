import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, Book, Package, QrCode, Users, Calendar, FileText, ChevronDown, ChevronRight } from 'lucide-react';

const HelpScreen: React.FC = () => {
  const { navigateTo } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

  const helpSections = [
    {
      id: 'getting-started',
      icon: <Book size={24} />,
      title: 'Getting Started',
      articles: [
        {
          title: 'Creating Your Account',
          content: `
            <h3>Step 1: Sign Up</h3>
            <ol>
              <li>Click the "Sign Up" button on the homepage</li>
              <li>Enter your email address and create a secure password</li>
              <li>Check your email for a verification link</li>
              <li>Click the verification link to activate your account</li>
            </ol>

            <h3>Step 2: Complete Your Profile</h3>
            <ol>
              <li>Log in to your new account</li>
              <li>Navigate to Settings (gear icon in sidebar)</li>
              <li>Add your organization name and details</li>
              <li>Upload a logo (optional)</li>
            </ol>

            <h3>Tips for Success</h3>
            <ul>
              <li>Use a strong password with letters, numbers, and symbols</li>
              <li>Keep your email address up to date for important notifications</li>
              <li>Start with the free plan and upgrade when needed</li>
            </ul>
          `
        },
        {
          title: 'Understanding the Dashboard',
          content: `
            <h3>Dashboard Overview</h3>
            <p>Your dashboard is mission control for all your gear management needs.</p>

            <h3>Key Sections:</h3>
            <ul>
              <li><strong>Quick Stats:</strong> See total inventory value, available items, and active jobs at a glance</li>
              <li><strong>Recent Activity:</strong> View the latest check-outs, check-ins, and changes</li>
              <li><strong>Upcoming Jobs:</strong> See what productions are scheduled and what gear is allocated</li>
              <li><strong>Low Stock Alerts:</strong> Get notified when items need attention</li>
            </ul>

            <h3>Navigation Tips:</h3>
            <ul>
              <li>Use the sidebar menu to jump between sections quickly</li>
              <li>Click your profile icon for quick access to settings</li>
              <li>Use the search bar to find items instantly</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'inventory',
      icon: <Package size={24} />,
      title: 'Managing Inventory',
      articles: [
        {
          title: 'Adding Items Manually',
          content: `
            <h3>Step 1: Navigate to Inventory</h3>
            <ol>
              <li>Click "Inventory" in the sidebar</li>
              <li>Click the green "+ Add Item" button</li>
            </ol>

            <h3>Step 2: Fill in Item Details</h3>
            <ul>
              <li><strong>Name:</strong> Give your item a clear, descriptive name (e.g., "Sony FX6 Camera Body")</li>
              <li><strong>Category:</strong> Choose from predefined categories or create your own</li>
              <li><strong>QR Code:</strong> Auto-generated or enter a custom code</li>
              <li><strong>Value:</strong> Enter the item's purchase or replacement value</li>
              <li><strong>Condition:</strong> Set as New, Good, Used, or Damaged</li>
              <li><strong>Purchase Date:</strong> Track when the item was acquired</li>
              <li><strong>Notes:</strong> Add any special details or serial numbers</li>
            </ul>

            <h3>Step 3: Upload Images</h3>
            <ol>
              <li>Click "Upload Image" to add a photo</li>
              <li>Choose a clear, well-lit image</li>
              <li>Images help with quick identification</li>
            </ol>

            <h3>Step 4: Save</h3>
            <p>Click "Save Item" and your gear is now in the system!</p>
          `
        },
        {
          title: 'Bulk Import via CSV',
          content: `
            <h3>Step 1: Prepare Your CSV File</h3>
            <p>Your CSV should have these columns (at minimum):</p>
            <ul>
              <li><strong>Name:</strong> Required - item name</li>
              <li><strong>Category:</strong> Optional - will use default if not specified</li>
              <li><strong>Value:</strong> Optional - numeric value</li>
              <li><strong>QR Code:</strong> Optional - auto-generated if not provided</li>
              <li><strong>Notes:</strong> Optional - additional details</li>
            </ul>

            <h3>Step 2: Import</h3>
            <ol>
              <li>Navigate to Inventory → Bulk Import</li>
              <li>Click "Choose File" under CSV Upload</li>
              <li>Select your CSV file</li>
              <li>Review the preview of items to be imported</li>
              <li>Set a default category if needed</li>
              <li>Click "Import" to add all items</li>
            </ol>

            <h3>Supported Formats:</h3>
            <ul>
              <li>CSV (Comma-separated)</li>
              <li>TSV (Tab-separated)</li>
              <li>TXT (Any delimiter)</li>
              <li>JSON (Array of objects)</li>
            </ul>

            <h3>Tips:</h3>
            <ul>
              <li>Keep your first row as headers</li>
              <li>Use consistent category names</li>
              <li>Remove currency symbols from values (use 1500 not $1,500)</li>
            </ul>
          `
        },
        {
          title: 'Organizing with Categories',
          content: `
            <h3>Using Categories</h3>
            <p>Categories help you organize gear by type, department, or any system that works for you.</p>

            <h3>Default Categories:</h3>
            <ul>
              <li>Camera</li>
              <li>Lens</li>
              <li>Lighting</li>
              <li>Audio</li>
              <li>Grip</li>
              <li>Tripod</li>
              <li>General</li>
            </ul>

            <h3>Creating Custom Categories:</h3>
            <ol>
              <li>When adding an item, type a new category name</li>
              <li>The system will remember it for future use</li>
              <li>Use consistent naming (e.g., always "Cameras" not sometimes "Camera")</li>
            </ol>

            <h3>Best Practices:</h3>
            <ul>
              <li>Keep categories broad (Camera, not "Sony Cameras")</li>
              <li>Use subcategories in the item name if needed</li>
              <li>Limit yourself to 10-15 main categories</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'qr-codes',
      icon: <QrCode size={24} />,
      title: 'QR Codes & Scanning',
      articles: [
        {
          title: 'Generating QR Codes',
          content: `
            <h3>Automatic Generation</h3>
            <p>Every item gets a unique QR code automatically when created.</p>

            <h3>Printing QR Codes:</h3>
            <ol>
              <li>Open any item's detail page</li>
              <li>Click the "Print Label" button</li>
              <li>Choose label size (suggested: 2" x 1" or larger)</li>
              <li>Print on adhesive label paper</li>
              <li>Apply label to your equipment</li>
            </ol>

            <h3>Label Placement Tips:</h3>
            <ul>
              <li>Place on a flat, clean surface</li>
              <li>Avoid areas that get heavy wear</li>
              <li>Use weatherproof labels for outdoor gear</li>
              <li>Consider placing backup labels on cases</li>
            </ul>

            <h3>Custom QR Codes:</h3>
            <p>You can use your own QR code system by entering custom codes when adding items.</p>
          `
        },
        {
          title: 'Scanning QR Codes',
          content: `
            <h3>Mobile Scanning</h3>
            <ol>
              <li>Open Gear Base on your mobile device</li>
              <li>Tap the scan icon (camera icon)</li>
              <li>Point camera at the QR code</li>
              <li>Item details appear instantly</li>
            </ol>

            <h3>During Check-Out/Check-In:</h3>
            <ol>
              <li>Start a check-out or check-in process</li>
              <li>Click "Scan Item"</li>
              <li>Scan each item's QR code</li>
              <li>System automatically adds items to the transaction</li>
            </ol>

            <h3>Troubleshooting:</h3>
            <ul>
              <li>Ensure good lighting</li>
              <li>Hold camera steady</li>
              <li>Clean the QR code if dirty</li>
              <li>Make sure camera has permission to access</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 'team',
      icon: <Users size={24} />,
      title: 'Team Management',
      articles: [
        {
          title: 'Adding Team Members',
          content: `
            <h3>Step 1: Navigate to Team</h3>
            <ol>
              <li>Click "Team" in the sidebar</li>
              <li>Click "+ Add Team Member"</li>
            </ol>

            <h3>Step 2: Enter Details</h3>
            <ul>
              <li><strong>Email:</strong> Member's work email</li>
              <li><strong>Full Name:</strong> First and last name</li>
              <li><strong>Role:</strong> Choose from Admin, Producer, or Crew</li>
            </ul>

            <h3>Understanding Roles:</h3>
            <ul>
              <li><strong>Admin:</strong> Full access - can manage team, inventory, and settings</li>
              <li><strong>Producer:</strong> Can create jobs, check out gear, view reports</li>
              <li><strong>Crew:</strong> Can view inventory and their assigned gear</li>
            </ul>

            <h3>Step 3: Send Invitation</h3>
            <ol>
              <li>Click "Send Invitation"</li>
              <li>Member receives an email invitation</li>
              <li>They click the link to set up their account</li>
            </ol>
          `
        },
        {
          title: 'Managing Permissions',
          content: `
            <h3>Role-Based Permissions</h3>

            <h4>Admin Can:</h4>
            <ul>
              <li>Add, edit, delete inventory</li>
              <li>Create and manage jobs</li>
              <li>Add/remove team members</li>
              <li>Change organization settings</li>
              <li>View all reports and analytics</li>
              <li>Check out/in gear</li>
            </ul>

            <h4>Producer Can:</h4>
            <ul>
              <li>View all inventory</li>
              <li>Create and manage their jobs</li>
              <li>Check out/in gear</li>
              <li>View reports</li>
              <li>Cannot add/remove team members</li>
              <li>Cannot change settings</li>
            </ul>

            <h4>Crew Can:</h4>
            <ul>
              <li>View inventory</li>
              <li>See gear assigned to them</li>
              <li>View their job assignments</li>
              <li>Cannot check out gear</li>
              <li>Limited report access</li>
            </ul>

            <h3>Changing Roles:</h3>
            <ol>
              <li>Go to Team section</li>
              <li>Click on a team member</li>
              <li>Select new role from dropdown</li>
              <li>Changes take effect immediately</li>
            </ol>
          `
        }
      ]
    },
    {
      id: 'jobs',
      icon: <Calendar size={24} />,
      title: 'Jobs & Productions',
      articles: [
        {
          title: 'Creating a New Job',
          content: `
            <h3>Step 1: Start a Job</h3>
            <ol>
              <li>Click "Jobs" in the sidebar</li>
              <li>Click "+ New Job"</li>
            </ol>

            <h3>Step 2: Fill in Job Details</h3>
            <ul>
              <li><strong>Job Name:</strong> Production name (e.g., "Summer Commercial Shoot")</li>
              <li><strong>Producer:</strong> Select the lead producer</li>
              <li><strong>Start Date:</strong> When production begins</li>
              <li><strong>End Date:</strong> When gear should be returned</li>
              <li><strong>Status:</strong> Upcoming, Active, or Completed</li>
            </ul>

            <h3>Step 3: Assign Equipment</h3>
            <ol>
              <li>Browse or search for items</li>
              <li>Click "Add to Job" for each piece needed</li>
              <li>Review the equipment list</li>
              <li>Save the job</li>
            </ol>

            <h3>Job Workflow:</h3>
            <ol>
              <li><strong>Create Job:</strong> Set up with dates and assigned gear</li>
              <li><strong>Check Out:</strong> When production starts, check out all gear</li>
              <li><strong>Production:</strong> Gear is marked as "Checked Out"</li>
              <li><strong>Check In:</strong> When production wraps, check gear back in</li>
              <li><strong>Complete:</strong> Mark job as complete</li>
            </ol>
          `
        },
        {
          title: 'Check-Out Process',
          content: `
            <h3>Starting a Check-Out</h3>
            <ol>
              <li>Open the job from Jobs list</li>
              <li>Click "Check Out Gear"</li>
              <li>Select items to check out (or scan QR codes)</li>
            </ol>

            <h3>Recording Condition</h3>
            <p>For each item:</p>
            <ul>
              <li>Inspect the item carefully</li>
              <li>Select current condition: New, Good, Used, or Damaged</li>
              <li>Add notes about any existing damage or issues</li>
              <li>Take photos if needed (click camera icon)</li>
            </ul>

            <h3>Assigning to Team Member</h3>
            <ol>
              <li>Select who is responsible for this gear</li>
              <li>This person will be accountable for its return</li>
            </ol>

            <h3>Digital Signature</h3>
            <ol>
              <li>Have the team member sign on screen</li>
              <li>This confirms they've received the gear in documented condition</li>
              <li>Signature is saved with the transaction</li>
            </ol>

            <h3>Complete Check-Out</h3>
            <ol>
              <li>Review all items and signatures</li>
              <li>Click "Complete Check-Out"</li>
              <li>Items are now marked as "Checked Out"</li>
              <li>Email confirmation sent automatically</li>
            </ol>
          `
        },
        {
          title: 'Check-In Process',
          content: `
            <h3>Starting a Check-In</h3>
            <ol>
              <li>Open the job from Jobs list</li>
              <li>Click "Check In Gear"</li>
              <li>Scan or select items being returned</li>
            </ol>

            <h3>Inspecting Returns</h3>
            <p>For each item:</p>
            <ul>
              <li>Inspect for any new damage</li>
              <li>Update condition if it has changed</li>
              <li>Note any issues in the notes field</li>
              <li>Compare to check-out condition</li>
            </ul>

            <h3>Handling Damaged Items</h3>
            <ol>
              <li>Select "Damaged" condition</li>
              <li>Describe the damage in detail</li>
              <li>Take photos of damage</li>
              <li>System will flag item for repair</li>
            </ol>

            <h3>Missing Items</h3>
            <ol>
              <li>Check "Mark as Missing" checkbox</li>
              <li>Item status changed to "Unavailable"</li>
              <li>Admin is notified</li>
              <li>Item removed from available inventory</li>
            </ol>

            <h3>Complete Check-In</h3>
            <ol>
              <li>Get signature from team member</li>
              <li>Review all items</li>
              <li>Click "Complete Check-In"</li>
              <li>Items return to "Available" status</li>
            </ol>
          `
        }
      ]
    },
    {
      id: 'reports',
      icon: <FileText size={24} />,
      title: 'Reports & Analytics',
      articles: [
        {
          title: 'Viewing Reports',
          content: `
            <h3>Available Reports</h3>
            <ul>
              <li><strong>Inventory Report:</strong> Complete list of all gear with values</li>
              <li><strong>Utilization Report:</strong> See which items are used most</li>
              <li><strong>Value Report:</strong> Total inventory value by category</li>
              <li><strong>Team Activity:</strong> Who's checking out what</li>
              <li><strong>Job History:</strong> Past productions and equipment used</li>
            </ul>

            <h3>Generating Reports</h3>
            <ol>
              <li>Click "Reports" in sidebar</li>
              <li>Choose report type</li>
              <li>Set date range if needed</li>
              <li>Click "Generate Report"</li>
            </ol>

            <h3>Exporting Data</h3>
            <ul>
              <li><strong>PDF:</strong> Formatted reports for sharing</li>
              <li><strong>CSV:</strong> Data for Excel or Google Sheets</li>
              <li><strong>Print:</strong> Hard copies for filing</li>
            </ul>
          `
        }
      ]
    }
  ];

  const filteredSections = searchQuery
    ? helpSections.map(section => ({
        ...section,
        articles: section.articles.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.articles.length > 0)
    : helpSections;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Help & Documentation
            </h1>
            <p className="text-xl text-emerald-50 mb-8">
              Everything you need to know about using Gear Base
            </p>
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-slate-900 text-lg focus:ring-2 focus:ring-emerald-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Help Content */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="space-y-4">
            {filteredSections.map((section) => (
              <div
                key={section.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-emerald-600 dark:text-emerald-400">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  {expandedSection === section.id ? (
                    <ChevronDown className="text-slate-600 dark:text-slate-400" size={24} />
                  ) : (
                    <ChevronRight className="text-slate-600 dark:text-slate-400" size={24} />
                  )}
                </button>

                {expandedSection === section.id && (
                  <div className="px-6 pb-6 space-y-6">
                    {section.articles.map((article, index) => (
                      <div key={index} className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                          {article.title}
                        </h3>
                        <div
                          className="prose prose-slate dark:prose-invert max-w-none
                            prose-headings:text-slate-900 dark:prose-headings:text-white
                            prose-p:text-slate-600 dark:prose-p:text-slate-400
                            prose-li:text-slate-600 dark:prose-li:text-slate-400
                            prose-strong:text-slate-900 dark:prose-strong:text-white"
                          dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="bg-slate-100 dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            Our support team is here to assist you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigateTo('CONTACT')}
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg"
            >
              Contact Support
            </button>
            <a
              href="mailto:info@mygearbase.com"
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-lg border border-slate-300 dark:border-slate-600 inline-block"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpScreen;
