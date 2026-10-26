# Feedback Management System

A web-based system where **admins create feedback forms on topics** and **users log in to answer them**. Admins can see who gave each feedback, with automatic sentiment analysis, alerts, team routing and CX metrics, and can reply to close the loop. Built with plain HTML, CSS and JavaScript. No server or database is needed.

## 1. How to run
1. Open the folder in VS Code and open `index.html` with the Live Server extension (or double-click `index.html`).
2. Log in with a demo account:
   - **Admin:** `admin@fms.com` / `admin123` (use the Admin tab)
   - **User:** `aarav@example.com` / `user123` (use the User tab). Other demo users: `diya@example.com`, `rohan@example.com`, same password.
3. New users can register from the login page. The admin account is pre-created.
4. **Reset demo data** on the admin page restores the sample data.

## 2. Project structure
| File | Function |
|---|---|
| `index.html` | Login and registration page with User / Admin tabs |
| `user.html` | User page: forms meant for the user, give feedback, view own feedback and replies |
| `admin.html` | Admin page: create forms, metrics, alerts, who gave feedback, reply |
| `css/style.css` | All styling |
| `js/login.js` | Login and registration logic |
| `js/auth.js` | Session handling, page guard by role, logout, HTML-escape helper |
| `js/storage.js` | Data layer on localStorage, demo users, forms and feedback |
| `js/workflows.js` | Score scales, low-score and alert rules, team routing |
| `js/analysis.js` | Keyword-based sentiment, theme and urgency detection |
| `js/user.js` | Logic of the user page |
| `js/admin.js` | Logic of the admin page |

Script order: `analysis.js`, `workflows.js`, `storage.js`, `auth.js`, then the page script.

## 3. User roles
| Role | Can do |
|---|---|
| **User** | Register, log in, see active forms for their plan, submit feedback once per form, track status and read the admin's reply |
| **Admin** | Log in, create/turn off/delete forms, see every response with the user's name, email and plan, filter responses, reply, change status, view metrics and alerts |

## 4. Feature implementation
| Feature | How it works |
|---|---|
| Admin-created forms | Admin enters title, topic, survey type (NPS/CSAT/CES), audience and an optional question. The form appears for matching users instantly. |
| Multi-channel collection | The user chooses the channel (Email, SMS, WhatsApp, Website Pop-up, In-App Survey, QR Code, Kiosk, Web Widget). Channels are simulated. |
| Centralized dashboard | All responses are in one admin table with filters for form, sentiment and status. |
| Who gave feedback | Each response stores the user's name, email and plan, shown in the admin table. |
| AI and sentiment analysis | Counts positive/negative words for sentiment, matches keywords to a theme (Bug, Feature Request, Complaint, Praise, General), detects urgent words. |
| CX metrics | NPS, CSAT and CES are calculated live from all responses. |
| Workflows and alerts | An alert is raised on a low score, negative sentiment or urgent words; the response is routed to a team by theme. |
| Closing the loop | Admin replies and sets New / In Progress / Resolved; the user sees the reply on their page. |
| Segmentation and survey fatigue | A form can target All, Free, Premium or Enterprise users; each user can answer a form only once. |
| CRM link | User profile (name, email, plan) is attached to every response, like a CRM customer record. |

## 5. Logic in plain words
- **NPS** (0-10) = % promoters (9-10) minus % detractors (0-6).
- **CSAT** (1-5) = % of users giving 4 or 5.
- **CES** (1-7) = average score (higher is easier).
- **Low score:** NPS 6 or less, CSAT 2 or less, CES 3 or less.
- **Alert** = low score OR negative sentiment OR urgent words.
- **Routing:** Bug to Engineering, Feature Request to Product, Complaint to Support, Praise to Marketing, General to Support.
- **Flow:** Admin creates form, user logs in and answers, `analysis.js` finds sentiment and theme, `workflows.js` sets alert and team, `storage.js` saves it, admin sees it, replies, and the user sees the reply.

## 6. Data model (localStorage key `fms_data_v2`)
- **users:** id, name, email, password, role (user/admin), plan
- **forms:** id, title, topic, type, question, target, active, created
- **feedback:** id, formId, formTitle, userId, userName, userEmail, plan, channel, type, score, comment, date, sentiment, category, urgent, team, alert, status, replies[]
- The logged-in user is kept in sessionStorage, so closing the tab logs out and an admin and a user can be logged in at the same time in different tabs.

## 7. Limitations (be honest in the report)
- Login is a front-end demo. Passwords are stored in plain text in the browser, so this is not secure for real use.
- Data lives only in one browser. A real system needs a backend (for example Java Spring Boot with MySQL) and hashed passwords.
- Keyword NLP misses sarcasm and context; a real NLP or LLM API would be better.
- Email, SMS, WhatsApp, kiosk delivery and real CRM/helpdesk connections are simulated.

## 8. Future scope
Java Spring Boot backend and MySQL, secure authentication, real channel APIs (Twilio, email), CRM integrations, trend charts over time, exports, email alerts.

## 9. Suggested report and PPT outline
1. Problem statement  2. Objectives and features  3. Roles (user and admin)  4. Architecture and file structure  5. Processing flow  6. Metrics and rules  7. Data model  8. Screenshots (login, admin form creation, user feedback, admin response table, alert, reply)  9. Testing  10. Limitations and future scope  11. Conclusion

## 10. Demo script
1. Log in as admin, create a form "Delivery Experience", type CSAT, audience All.
2. Log out, log in as `diya@example.com` (User tab), open the new form, score 1, comment "Delivery was late, I want a refund immediately", send.
3. Log in as admin again: the response shows Diya's name, Negative sentiment, Complaint theme, routed to Support, with an alert.
4. Reply and mark Resolved, then log in as Diya to see the reply.
