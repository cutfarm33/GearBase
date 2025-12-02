import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Search, Book, Package, QrCode, Users, Calendar, FileText, CheckCircle } from 'lucide-react';

const HelpScreen: React.FC = () => {
  const { navigateTo } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const helpSections = [
    {
      id: 'getting-started',
      icon: <Book size={24} />,
      title: 'Getting Started',
      color: 'emerald',
      articles: [
        {
          title: 'Creating Your Account',
          steps: [
            {
              heading: 'Step 1: Sign Up',
              items: [
                'Click the "Sign Up" button on the homepage',
                'Enter your email address and create a secure password',
                'Check your email for a verification link',
                'Click the verification link to activate your account'
              ]
            },
            {
              heading: 'Step 2: Complete Your Profile',
              items: [
                'Log in to your new account',
                'Navigate to Settings (gear icon in sidebar)',
                'Add your organization name and details',
                'Upload a logo (optional)'
              ]
            },
            {
              heading: 'Tips for Success',
              items: [
                'Use a strong password with letters, numbers, and symbols',
                'Keep your email address up to date for important notifications',
                'Start with the free plan and upgrade when needed'
              ]
            }
          ]
        },
        {
          title: 'Understanding the Dashboard',
          steps: [
            {
              heading: 'Dashboard Overview',
              description: 'Your dashboard is mission control for all your gear management needs.',
              items: []
            },
            {
              heading: 'Key Sections',
              items: [
                'Quick Stats: See total inventory value, available items, and active jobs at a glance',
                'Recent Activity: View the latest check-outs, check-ins, and changes',
                'Upcoming Jobs: See what productions are scheduled and what gear is allocated',
                'Low Stock Alerts: Get notified when items need attention'
              ]
            },
            {
              heading: 'Navigation Tips',
              items: [
                'Use the sidebar menu to jump between sections quickly',
                'Click your profile icon for quick access to settings',
                'Use the search bar to find items instantly'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'inventory',
      icon: <Package size={24} />,
      title: 'Managing Inventory',
      color: 'teal',
      articles: [
        {
          title: 'Adding Items Manually',
          steps: [
            {
              heading: 'Step 1: Navigate to Inventory',
              items: [
                'Click "Inventory" in the sidebar',
                'Click the green "+ Add Item" button'
              ]
            },
            {
              heading: 'Step 2: Fill in Item Details',
              items: [
                'Name: Give your item a clear, descriptive name (e.g., "Sony FX6 Camera Body")',
                'Category: Choose from predefined categories or create your own',
                'QR Code: Auto-generated or enter a custom code',
                'Value: Enter the item\'s purchase or replacement value',
                'Condition: Set as New, Good, Used, or Damaged',
                'Purchase Date: Track when the item was acquired',
                'Notes: Add any special details or serial numbers'
              ]
            },
            {
              heading: 'Step 3: Upload Images',
              items: [
                'Click "Upload Image" to add a photo',
                'Choose a clear, well-lit image',
                'Images help with quick identification'
              ]
            },
            {
              heading: 'Step 4: Save',
              description: 'Click "Save Item" and your gear is now in the system!'
            }
          ]
        },
        {
          title: 'Bulk Import via CSV',
          steps: [
            {
              heading: 'Step 1: Prepare Your CSV File',
              description: 'Your CSV should have these columns (at minimum):',
              items: [
                'Name: Required - item name',
                'Category: Optional - will use default if not specified',
                'Value: Optional - numeric value',
                'QR Code: Optional - auto-generated if not provided',
                'Notes: Optional - additional details'
              ]
            },
            {
              heading: 'Step 2: Import',
              items: [
                'Navigate to Inventory → Bulk Import',
                'Click "Choose File" under CSV Upload',
                'Select your CSV file',
                'Review the preview of items to be imported',
                'Set a default category if needed',
                'Click "Import" to add all items'
              ]
            },
            {
              heading: 'Supported Formats',
              items: [
                'CSV (Comma-separated)',
                'TSV (Tab-separated)',
                'TXT (Any delimiter)',
                'JSON (Array of objects)'
              ]
            },
            {
              heading: 'Tips',
              items: [
                'Keep your first row as headers',
                'Use consistent category names',
                'Remove currency symbols from values (use 1500 not $1,500)'
              ]
            }
          ]
        },
        {
          title: 'Organizing with Categories',
          steps: [
            {
              heading: 'Using Categories',
              description: 'Categories help you organize gear by type, department, or any system that works for you.',
              items: []
            },
            {
              heading: 'Default Categories',
              items: [
                'Camera',
                'Lens',
                'Lighting',
                'Audio',
                'Grip',
                'Tripod',
                'General'
              ]
            },
            {
              heading: 'Creating Custom Categories',
              items: [
                'When adding an item, type a new category name',
                'The system will remember it for future use',
                'Use consistent naming (e.g., always "Cameras" not sometimes "Camera")'
              ]
            },
            {
              heading: 'Best Practices',
              items: [
                'Keep categories broad (Camera, not "Sony Cameras")',
                'Use subcategories in the item name if needed',
                'Limit yourself to 10-15 main categories'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'qr-codes',
      icon: <QrCode size={24} />,
      title: 'QR Codes & Scanning',
      color: 'blue',
      articles: [
        {
          title: 'Generating QR Codes',
          steps: [
            {
              heading: 'Automatic Generation',
              description: 'Every item gets a unique QR code automatically when created.',
              items: []
            },
            {
              heading: 'Printing QR Codes',
              items: [
                'Open any item\'s detail page',
                'Click the "Print Label" button',
                'Choose label size (suggested: 2" x 1" or larger)',
                'Print on adhesive label paper',
                'Apply label to your equipment'
              ]
            },
            {
              heading: 'Label Placement Tips',
              items: [
                'Place on a flat, clean surface',
                'Avoid areas that get heavy wear',
                'Use weatherproof labels for outdoor gear',
                'Consider placing backup labels on cases'
              ]
            },
            {
              heading: 'Custom QR Codes',
              description: 'You can use your own QR code system by entering custom codes when adding items.'
            }
          ]
        },
        {
          title: 'Scanning QR Codes',
          steps: [
            {
              heading: 'Mobile Scanning',
              items: [
                'Open Gear Base on your mobile device',
                'Tap the scan icon (camera icon)',
                'Point camera at the QR code',
                'Item details appear instantly'
              ]
            },
            {
              heading: 'During Check-Out/Check-In',
              items: [
                'Start a check-out or check-in process',
                'Click "Scan Item"',
                'Scan each item\'s QR code',
                'System automatically adds items to the transaction'
              ]
            },
            {
              heading: 'Troubleshooting',
              items: [
                'Ensure good lighting',
                'Hold camera steady',
                'Clean the QR code if dirty',
                'Make sure camera has permission to access'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'team',
      icon: <Users size={24} />,
      title: 'Team Management',
      color: 'teal',
      articles: [
        {
          title: 'Adding Team Members',
          steps: [
            {
              heading: 'Step 1: Navigate to Team',
              items: [
                'Click "Team" in the sidebar',
                'Click "+ Add Team Member"'
              ]
            },
            {
              heading: 'Step 2: Enter Details',
              items: [
                'Email: Member\'s work email',
                'Full Name: First and last name',
                'Role: Choose from Admin, Producer, or Crew'
              ]
            },
            {
              heading: 'Understanding Roles',
              items: [
                'Admin: Full access - can manage team, inventory, and settings',
                'Producer: Can create jobs, check out gear, view reports',
                'Crew: Can view inventory and their assigned gear'
              ]
            },
            {
              heading: 'Step 3: Send Invitation',
              items: [
                'Click "Send Invitation"',
                'Member receives an email invitation',
                'They click the link to set up their account'
              ]
            }
          ]
        },
        {
          title: 'Managing Permissions',
          steps: [
            {
              heading: 'Admin Can',
              items: [
                'Add, edit, delete inventory',
                'Create and manage jobs',
                'Add/remove team members',
                'Change organization settings',
                'View all reports and analytics',
                'Check out/in gear'
              ]
            },
            {
              heading: 'Producer Can',
              items: [
                'View all inventory',
                'Create and manage their jobs',
                'Check out/in gear',
                'View reports',
                'Cannot add/remove team members',
                'Cannot change settings'
              ]
            },
            {
              heading: 'Crew Can',
              items: [
                'View inventory',
                'See gear assigned to them',
                'View their job assignments',
                'Cannot check out gear',
                'Limited report access'
              ]
            },
            {
              heading: 'Changing Roles',
              items: [
                'Go to Team section',
                'Click on a team member',
                'Select new role from dropdown',
                'Changes take effect immediately'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'jobs',
      icon: <Calendar size={24} />,
      title: 'Jobs & Productions',
      color: 'emerald',
      articles: [
        {
          title: 'Creating a New Job',
          steps: [
            {
              heading: 'Step 1: Start a Job',
              items: [
                'Click "Jobs" in the sidebar',
                'Click "+ New Job"'
              ]
            },
            {
              heading: 'Step 2: Fill in Job Details',
              items: [
                'Job Name: Production name (e.g., "Summer Commercial Shoot")',
                'Producer: Select the lead producer',
                'Start Date: When production begins',
                'End Date: When gear should be returned',
                'Status: Upcoming, Active, or Completed'
              ]
            },
            {
              heading: 'Step 3: Assign Equipment',
              items: [
                'Browse or search for items',
                'Click "Add to Job" for each piece needed',
                'Review the equipment list',
                'Save the job'
              ]
            },
            {
              heading: 'Job Workflow',
              items: [
                'Create Job: Set up with dates and assigned gear',
                'Check Out: When production starts, check out all gear',
                'Production: Gear is marked as "Checked Out"',
                'Check In: When production wraps, check gear back in',
                'Complete: Mark job as complete'
              ]
            }
          ]
        },
        {
          title: 'Check-Out Process',
          steps: [
            {
              heading: 'Starting a Check-Out',
              items: [
                'Open the job from Jobs list',
                'Click "Check Out Gear"',
                'Select items to check out (or scan QR codes)'
              ]
            },
            {
              heading: 'Recording Condition',
              description: 'For each item:',
              items: [
                'Inspect the item carefully',
                'Select current condition: New, Good, Used, or Damaged',
                'Add notes about any existing damage or issues',
                'Take photos if needed (click camera icon)'
              ]
            },
            {
              heading: 'Assigning to Team Member',
              items: [
                'Select who is responsible for this gear',
                'This person will be accountable for its return'
              ]
            },
            {
              heading: 'Digital Signature',
              items: [
                'Have the team member sign on screen',
                'This confirms they\'ve received the gear in documented condition',
                'Signature is saved with the transaction'
              ]
            },
            {
              heading: 'Complete Check-Out',
              items: [
                'Review all items and signatures',
                'Click "Complete Check-Out"',
                'Items are now marked as "Checked Out"',
                'Email confirmation sent automatically'
              ]
            }
          ]
        },
        {
          title: 'Check-In Process',
          steps: [
            {
              heading: 'Starting a Check-In',
              items: [
                'Open the job from Jobs list',
                'Click "Check In Gear"',
                'Scan or select items being returned'
              ]
            },
            {
              heading: 'Inspecting Returns',
              description: 'For each item:',
              items: [
                'Inspect for any new damage',
                'Update condition if it has changed',
                'Note any issues in the notes field',
                'Compare to check-out condition'
              ]
            },
            {
              heading: 'Handling Damaged Items',
              items: [
                'Select "Damaged" condition',
                'Describe the damage in detail',
                'Take photos of damage',
                'System will flag item for repair'
              ]
            },
            {
              heading: 'Missing Items',
              items: [
                'Check "Mark as Missing" checkbox',
                'Item status changed to "Unavailable"',
                'Admin is notified',
                'Item removed from available inventory'
              ]
            },
            {
              heading: 'Complete Check-In',
              items: [
                'Get signature from team member',
                'Review all items',
                'Click "Complete Check-In"',
                'Items return to "Available" status'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'reports',
      icon: <FileText size={24} />,
      title: 'Reports & Analytics',
      color: 'blue',
      articles: [
        {
          title: 'Viewing Reports',
          steps: [
            {
              heading: 'Available Reports',
              items: [
                'Inventory Report: Complete list of all gear with values',
                'Utilization Report: See which items are used most',
                'Value Report: Total inventory value by category',
                'Team Activity: Who\'s checking out what',
                'Job History: Past productions and equipment used'
              ]
            },
            {
              heading: 'Generating Reports',
              items: [
                'Click "Reports" in sidebar',
                'Choose report type',
                'Set date range if needed',
                'Click "Generate Report"'
              ]
            },
            {
              heading: 'Exporting Data',
              items: [
                'PDF: Formatted reports for sharing',
                'CSV: Data for Excel or Google Sheets',
                'Print: Hard copies for filing'
              ]
            }
          ]
        }
      ]
    }
  ];

  const filteredSections = searchQuery
    ? helpSections.map(section => ({
        ...section,
        articles: section.articles.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.steps.some(step =>
            step.heading.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (step.description && step.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (step.items && step.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase())))
          )
        )
      })).filter(section => section.articles.length > 0)
    : helpSections;

  return (
    <div className="min-h-screen bg-gradient-hero dark:bg-gradient-to-br dark:from-slate-900 dark:via-emerald-950/50 dark:to-slate-900 text-slate-900 dark:text-white font-sans selection:bg-emerald-500 selection:text-white animate-gradient bg-[length:200%_200%]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        {/* Depth layer - subtle gradient overlay for light mode */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-emerald-50/30 to-transparent dark:from-transparent dark:via-transparent dark:to-transparent"></div>
        {/* Subtle shadow at bottom for depth */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200/40 to-transparent dark:via-emerald-900/20"></div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Help & <span className="text-teal-600 dark:text-teal-400">Documentation</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
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
                className="w-full pl-12 pr-4 py-4 rounded-xl text-slate-900 dark:text-white text-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none glass-card shadow-glass"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 px-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {helpSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveCategory(section.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-sm ${
                  activeCategory === section.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600'
                }`}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Help Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {filteredSections
            .filter(section => !activeCategory || section.id === activeCategory)
            .map((section) => (
            <div key={section.id} className="mb-12">
              {/* Section Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                    section.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' :
                    section.color === 'teal' ? 'bg-gradient-to-br from-teal-500 to-emerald-500' :
                    'bg-gradient-to-br from-blue-500 to-teal-500'
                  }`}>
                    {section.icon}
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
              </div>

              {/* Articles Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.articles.map((article, articleIndex) => (
                  <div
                    key={articleIndex}
                    className="glass-card rounded-2xl p-8 shadow-glass hover:shadow-glass-lg transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-2xl ${
                      section.color === 'emerald' ? 'bg-gradient-to-br from-emerald-500/10 to-transparent' :
                      section.color === 'teal' ? 'bg-gradient-to-br from-teal-500/10 to-transparent' :
                      'bg-gradient-to-br from-blue-500/10 to-transparent'
                    }`}></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                        {article.title}
                      </h3>
                      <div className="space-y-6">
                        {article.steps.map((step, stepIndex) => (
                          <div key={stepIndex}>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                              {step.heading}
                            </h4>
                            {step.description && (
                              <p className="text-slate-600 dark:text-white mb-3 leading-relaxed">
                                {step.description}
                              </p>
                            )}
                            {step.items && step.items.length > 0 && (
                              <ul className="space-y-2">
                                {step.items.map((item, itemIndex) => (
                                  <li key={itemIndex} className="flex items-start text-sm text-slate-600 dark:text-white">
                                    <CheckCircle size={16} className="text-teal-500 dark:text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-3xl p-10 md:p-16 text-center shadow-glass-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Still Need Help?
              </h2>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
                Our support team is here to assist you.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => navigateTo('CONTACT')}
                  className="glass-button text-white px-8 py-4 rounded-xl font-bold shadow-glow-teal hover:shadow-glow-emerald hover:scale-105 transition-all text-lg"
                >
                  Contact Support
                </button>
                <a
                  href="mailto:info@mygearbase.com"
                  className="glass-card text-slate-900 dark:text-white px-8 py-4 rounded-xl font-bold hover-float shadow-glass hover:shadow-glass-lg border border-emerald-200/50 dark:border-teal-500/30 text-lg"
                >
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpScreen;
