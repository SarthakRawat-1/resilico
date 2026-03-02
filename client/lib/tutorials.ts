import { DriveStep } from "driver.js";

type TutorialSteps = {
    [key: string]: DriveStep[];
};

export const tutorialSteps: TutorialSteps = {
    "/dashboard": [
        {
            popover: {
                title: "Welcome to Resilico!",
                description: "This is your Dashboard, the command center for monitoring your community's financial health. Let's take a quick tour to see what everything means.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: ".stat-members",
            popover: {
                title: "Total Members",
                description: "This shows how many individuals, families, or businesses are currently participating in your community simulation.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".stat-loans",
            popover: {
                title: "Total Loans",
                description: "The total number of financial connections or debts between your members. It shows how financially intertwined everyone is.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".stat-default-rate",
            popover: {
                title: "Default Rate",
                description: "This is a crucial metric! It shows the percentage of loans that are currently failing to be paid back. You want to keep this number as low as possible.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".stat-resilience",
            popover: {
                title: "Resilience Score",
                description: "A quick pulse on how well your community can survive an unexpected economic shock or disaster. Higher is always better.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".stability-breakdown-section",
            popover: {
                title: "Stability Breakdown",
                description: "This breaks down your ultimate score into four key ingredients: Default Rate (40%), Liquidity (30%), Risk Concentration (20%), and Trust (10%). Use this to see exactly where your community is strong or struggling.",
                side: "right",
                align: "start",
            },
        },
        {
            element: ".overall-index-section",
            popover: {
                title: "The Ultimate Score",
                description: "Like a credit score for your entire community. Keep the needle in the green zone to ensure everyone thrives! If it drops to orange or red, action is needed.",
                side: "left",
                align: "start",
            },
        }
    ],
    "/data": [
        {
            popover: {
                title: "The Data Hub",
                description: "This is the control room where you manually add or remove people from your community, and manage the loans between them.",
                side: "bottom",
                align: "center",
            }
        },
        {
            element: ".data-tabs-section",
            popover: {
                title: "Switching Views",
                description: "Use these tabs to switch between managing your 'Members' (the people) and your 'Loans' (who owes money to whom).",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".add-member-btn",
            popover: {
                title: "Create a Member",
                description: "Click this button to open the form and add a new person or business to the simulation.",
                side: "left",
                align: "start",
            },
        },
        {
            element: ".add-member-form",
            popover: {
                title: "Simulating a Person",
                description: "When adding someone, give them an Income, basic Expenses, and an Emergency Reserve (their savings account). High Trust makes them more likely to pay back loans.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".members-table",
            popover: {
                title: "The Community Roster",
                description: "Once added, members show up in this list. Keep an eye on the 'Health' badge—if their expenses are too close to their income, they become 'At Risk'.",
                side: "top",
                align: "start",
            },
        },
        {
            element: ".tab-loans",
            popover: {
                title: "Managing Debts",
                description: "When you switch to the Loans tab, you can manage financial connections.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".add-exposure-btn",
            popover: {
                title: "Create a Loan",
                description: "Here you can create a loan. You'll simply need the ID number of the Lender and the ID number of the Borrower.",
                side: "left",
                align: "start",
            },
        },
        {
            element: ".exposures-table",
            popover: {
                title: "Active Loans Tracker",
                description: "All active loans appear here. The 'Repay Prob' (Probability of Repayment) shows how mathematically likely the borrower is to actually pay the lender back based on their savings.",
                side: "top",
                align: "start",
            },
        }
    ],
    "/network": [
        {
            popover: {
                title: "Network Map",
                description: "Welcome to the Network view! This is a visual map of all the money flowing through your community. Let's learn how to read it.",
                side: "bottom",
                align: "center",
            }
        },
        {
            element: ".network-graph-container",
            popover: {
                title: "Connecting the Dots",
                description: "Every dot (node) is a member. The arrows pointing between them are loans. Bigger dots mean bigger savings! Feel free to drag them around with your mouse.",
                side: "bottom",
                align: "center",
            },
        },
        {
            element: ".network-graph-container",
            popover: {
                title: "Color Coding",
                description: "Colors matter! Green dots are financially healthy. Yellow means caution. Red dots are in severe danger of going broke.",
                side: "top",
                align: "center",
            },
        },
        {
            element: ".metric-centrality",
            popover: {
                title: "Degree Centrality",
                description: "This score shows which members are the most 'connected'. If these highly-connected people go broke, it could crash the whole network like a domino effect.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".metric-exposure",
            popover: {
                title: "Weighted Exposure",
                description: "This simply shows who is owed the most money in total across the entire community.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".metric-trust",
            popover: {
                title: "Trust Propagation",
                description: "A complex score calculating how reliable a member's network is. Think of it like Google's search algorithm, but for financial trustworthiness.",
                side: "top",
                align: "start",
            },
        },
        {
            element: ".metric-concentration",
            popover: {
                title: "Risk Concentration",
                description: "This highlights poor lending practices. If a member has lent out way too much money compared to what they have in their own bank account, their risk is 'highly concentrated'.",
                side: "top",
                align: "start",
            },
        }
    ],
    "/simulation": [
        {
            popover: {
                title: "The Time Machine",
                description: "Welcome to the Simulation Engine. We take all your members and loans, and fast-forward time to see what happens in the future.",
                side: "bottom",
                align: "center",
            }
        },
        {
            element: ".simulation-timeline",
            popover: {
                title: "Set Time Travel Length",
                description: "Use this slider to choose how many weeks into the future you want to simulate. 52 weeks (one year) is a great starting point.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".simulation-run-btn",
            popover: {
                title: "Run the Engine!",
                description: "Click START to run the time machine! Our math engine will calculate exactly who pays their bills, who defaults, and how wealth changes week by week.",
                side: "left",
                align: "start",
            },
        },
        {
            element: ".simulation-chart",
            popover: {
                title: "Tracking Wealth",
                description: "Once the simulation finishes, this chart shows the total cash in the community over time. The red bars at the bottom spike up if anyone goes completely broke during that specific week.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".cascade-viewer",
            popover: {
                title: "The Domino Effect",
                description: "If one person goes broke, they can't pay back their loans. That means their lender might go broke too! This viewer maps out that exact chain reaction, showing who took down who.",
                side: "top",
                align: "start",
            },
        }
    ],
    "/stress-test": [
        {
            popover: {
                title: "The Disaster Lab",
                description: "Welcome to the Stress Test lab! Here, we throw terrible financial disasters at your community to see if they are strong enough to survive it.",
                side: "bottom",
                align: "center",
            }
        },
        {
            element: ".monte-carlo-config",
            popover: {
                title: "Monte Carlo Engine",
                description: "Instead of just guessing once, we run the disaster simulation over and over (like 100 times) to find the absolute most mathematically likely outcome.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".scenario-income-shock",
            popover: {
                title: "Income Shock",
                description: "What if a major employer leaves town and everyone's income suddenly drops by 30%? Run this to see how many people survive.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".scenario-expense-spike",
            popover: {
                title: "Expense Spike",
                description: "What if severe inflation or an energy crisis causes everything to cost 50% more? Test it here.",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".scenario-random-defaults",
            popover: {
                title: "Random Defaults",
                description: "What if 5 completely random people refuse or forget to pay their debts? Does it cause a chain reaction that ruins others?",
                side: "top",
                align: "start",
            },
        },
        {
            element: ".scenario-targeted-shock",
            popover: {
                title: "Targeted Shock",
                description: "The ultimate nightmare: what if the absolute richest, most connected person goes broke? This is the ultimate test of the community's resilience.",
                side: "top",
                align: "start",
            },
        },
        {
            element: ".stress-test-table",
            popover: {
                title: "Reading the Results",
                description: "After running a test, check the 'Worst Case' percentage. For example, if the worst case defaults hit 80%, it means this specific disaster could potentially wipe out 80% of your community!",
                side: "top",
                align: "start",
            },
        }
    ],
    "/reports": [
        {
            popover: {
                title: "Final Output",
                description: "The Reports page is your final analysis dashboard, cleanly formatted and perfect for presenting to community leaders or city councils.",
                side: "bottom",
                align: "center",
            }
        },
        {
            element: ".stability-gauge",
            popover: {
                title: "Community Scorecard",
                description: "Your overall Community Financial Stability Score. Print this out and put it on your fridge if it's over 80/100!",
                side: "bottom",
                align: "start",
            },
        },
        {
            element: ".stability-components",
            popover: {
                title: "Fixing the Leaks",
                description: "The detailed breakdown of your score. Use these specific numbers to identify exactly what your community is struggling with (e.g., if Risk Concentration is a 'D', you have a problem with lopsided lending).",
                side: "left",
                align: "start",
            },
        },
        {
            element: ".ai-recommendations",
            popover: {
                title: "A.I. Automated Advice",
                description: "Our A.I. engine automatically looks at your community's weaknesses and provides a prioritized list of real-world policies you can implement to improve.",
                side: "top",
                align: "start",
            },
        },
        {
            element: ".export-btn",
            popover: {
                title: "Generate PDF",
                description: "Click here to instantly download a professional, multi-page PDF report containing all this data and A.I. advice, ready for your next meeting.",
                side: "left",
                align: "start",
            },
        }
    ]
};
