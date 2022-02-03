# <img src="images/partchain-logo.svg" alt="PartChain Logo"/> PartChain - User Guide

<br>

## Table of contents
---

- [Introduction](#introduction)
    - [Scope and purpose](#scope-and-purpose)
- [Getting started](#getting-started)
    - [Accessing the app](#Accessing-the-app)
        - [Login](#Login)
        - [Sign-out](#sign-out)
    - [Navigation](#navigation)
        - [Header](#header)
        - [Main navigation](#left-side-menu)
- [Features](#features)
    - [Dashboard (Home)](#dashboard)
    - [Find part](#find-parts)
    - [View Parts Details](#view-parts-details)
    - [Raise Quality Alert](#raise-quality-alert)  
    - [Add parts to a Queued Quality Alert](#add-parts-to-a-queued-quality-alert)
    - [Distribute quality alerts to customers](#distribute-quality-alerts-to-customers)
    - [Request quality investigation](#request-quality-investigation)
    - [Send Quality Investigation to supplier](#send-quality-investigation-to-supplier)
    - [Raise quality alert from quality investigation](#raise-quality-alert-from-quality-investigation)
    - [Raise quality investigation from quality investigation](#raise-quality-investigation-from-quality-investigation)
    - [Access control](#access-control)
    
<br>

---
---

<br>

# Introduction

<br>

## **Scope and purpose**
PartChain is a traceability supply chain app built for existing supply chain ecosystems to transform into the digitally connected world. PartChain spans across companies and creates a collaborative network that is both fast and secure in its processes. It is based on Blockchain technology and has a state-of-the-art user interface that is easy to understand and ready for use.

As a PartChain user, you can access all information concerning parts and components on an individual level. You can track the record of individual parts, raise quality alerts on your parts and distribute them to your customers, and receive quality alerts from supplier parts that may affect your parts. It is also possible to request investigations to suppliers parts and receive investigations requests from customers, thus creating a connected supply chain, providing transparency within your network.

<br>
<br>

[Back to top](#)

<br>
<br>

[-- End of 'Introduction' section --]: # 

# Getting started

<br>

## **Accessing the app**

[PartChain](#) can be accessed via the internet. The recommended browser is Google Chrome. You can login with PartChain credentials or Catena-X (MFA) account.

<br>

### **Login** 

<img src="./images/PC_Login.png" height="60%" width="60%">

1. Open PartChain via the URL: # (recommended browser Google Chrome).
1. Enter the user name and password. If the login data is correct, the dashboard of the PartChain UI opens. If the information are incorrect, as error message will be displayed.
1. After your first log-in you are shown a Welcome message and a short introduction to the PartChain system and you will be able to start using the application.

<br>

### **Sign out**

<img src="images/PC_SignOut.png" alt="PartChain Logo" width="320"/>

1. On the header, click on the user avatar
1. On the menu click on "Sign-out"
1. You have signed-out of PartChain

<br>
<br>

[Back to top](#)

<br>
<br>

[-- End of 'Getting started' section --]: # 

# Navigation

PartChain navigation is based on a header and a left-side menu.

<br>

## **Header**

<img src="images/PC_Header.png" alt="PartChain header"/>

1 - On the left side on the header, there is the PartChain logo which redirects the user to the Dashboard (Home) area. 

2 - On the right side of the header, there is the name and avatar of the logged-in user. When clicked, it is possible to see the avatar, the role of the user, the name of the user, and the option to Sign-out.

<br>

## **Left-side menu**

<img src="images/PC_Navigation.png" alt="PartChain navigation" height="350"/>
<img src="images/PC_Navigation-open.png" alt="PartChain open navigation" height="350"/>


On the left side menu, it is possible to navigate the PartChain application by choosing each of the following options / features:

- Dashboard
- Find parts
- My Parts
- Supplier / Customer parts
- Quality alerts
- Quality investigations
- Access control
- About

<br>
<br>

[Back to top](#)

<br>
<br>

[-- End of 'Navigation' section --]: # 

# Features

## Dashboard

The PartChain dashboard is the main entrance of the application. It provides an overview of the company's parts: 
1. Total of company's parts; 
1. Total of parts with quality alerts / investigations;
1. Latest received quality alerts / investigations; 
1. Percentage of each quality alert type;  
1. Evolution of quality alerts over time; 
1. Number of parts per country registered in PartChain (withing network)

<img src="images/PC_Dashboard.png" height="60%" width="60%"/>

<br>
<br>

[Back to top](#)

<br>
<br>

## Find parts

Manually enter or paste a part serial number in the search area. 

<img src="images/PC_FindPart.png" height="60%" width="60%" />

<br>

PartChain will automatically search the part and present the results found

<br>

<img src="images/PC_FindPart-Results.png" height="60%" width="60%"/>

<br>
<br>

[Back to top](#)

<br>
<br>

## View Parts details

To view a part's details, click on the part which details you want to view.

<img src="images/PC_MyParts.png" height="60%" width="60%" />

<br>

Doing so, will open a sidebar with a summary of the details.

<img src="images/PC_MyParts-open.png" height="60%" width="60%"/>

<br>

Clicking on "See full details" on the sidebar, will link to the parts full details page

<img src="images/PC_MyParts-details.png" height="60%" width="60%"/>

<br>
<br>

[Back to top](#)

<br>
<br>

## Raise Quality Alert

On My Parts page, select the part(s) and click on "Change quality type" button

<img src="images/PC_MyParts-QA01.png" height="60%" width="60%"/>

<br>

Choose the quality type for the part (Minor Issue, Major issue, Critical issue or Life-Threatning issue) and enter a discription

<img src="images/PC_MyParts-QA04.png" height="60%" width="60%"/>

<br>

By clicking on "Add to Queue" the quality type change will be added to the list of Queued Quality Alerts that pending distribuition to customers. Only after being distributed to customers will the Quality type of the part effectively change.

<img src="images/PC_MyParts-QA05.png" height="60%" width="60%"/>

<br>

To go to the Queued Quality Alerts list, click on the link in the yellow banner on the botton of the screen or navigate through the left-side navigation.

<img src="images/PC_MyParts-QA06.png" height="60%" width="60%"/>

<br>
<br>

[Back to top](#)

<br>
<br>

## Add parts to a Queued Quality Alert

After raising a Quality Alert, it is still possible to edit it, **before** distributing to customers, on the Queued Quality Alert list

<img src="images/PC_QA-Open.png" height="60%" width="60%"/>

<br>

On the options of the Quality Alert, click on "view details" 

<img src="images/PC_QA-Options.png" height="60%" width="60%"/>

<br>

To **add parts** to the queued Quality Alert, click "+ Add Parts" button 

<img src="images/PC_QA-Details.png" height="60%" width="60%"/>

<br>

Enter or paste the serial number of the part to add to the Quality alert, click "Add part" and, when all the parts are added, click "Save". 

<img src="images/PC_QA-AddParts2.png" height="60%" width="60%"/>

<br>
<br>

[Back to top](#)

<br>
<br>

## Distribute Quality Alerts to customers

There are multiple ways of distributing Quality alerts, depending on the quantity, and which page the user is in. 

On the Queued Quality Alerts list, it is possible to distribute all the Quality Alerts at once, using the "Distribute all" button on the top right of the list.

<img src="images/PC_QA2.png" height="60%" width="60%"/>

<br>

To distribute the Quality Alerts individually, there are 2 ways of doing so. On the Queued Quality Alerts list, it is possible to distribute a Quality Alert by opening its options menu and clicking on "Distribute to customers"

<img src="images/PC_QA-Options2.png" height="60%" width="60%"/>

<br>

On the Quality Alert details page, it is possible to distribute a Quality Alert by clicking on "Distribute to customers" button on the top right corner of the page.

<img src="images/PC_QA-Details.png" height="60%" width="60%"/>

<br>

Once the Quality Alert is distributed, all the customers (within the network) which parts will might be affected, will receive a Quality Alert. On the customer side, it will be shown in the Dashboard, on the Left-side navigation and on the Quality Alerts page on the "Received" list

<img src="images/PC_Dashboard-QA2.png" height="60%" width="60%"/>
<img src="images/PC_QA-Receive.png" height="60%" width="60%"/>

<br>

On the owner side, it will be shown in the on the Quality Alerts page on the "Distributed" list and no more changes are allowed.
<img src="images/PC_QA-Distributed.png" height="60%" width="60%"/>

<br>
<br>

[Back to top](#)

<br>
<br>

## Request Quality Investigation

On Other Parts page, on the Supplier parts tab, select the part(s) and click on "Request Quality investigation" button

<img src="images/PC_OtherParts-QI.png" height="60%" width="60%"/>

<br>

Enter a description and click "Add to Queue"

<img src="images/PC_OtherParts-QI02.png" height="60%" width="60%"/>

<br>

By clicking on "Add to Queue" the quality type change will be added to the list of Queued Quality Investigation that pending distribuition to suppliers. Only after being distributed to suppliers will the Quality investigation request be effectively sent.

<img src="images/PC_OtherParts-QI03.png" height="60%" width="60%"/>

<br>

To go to the Queued Quality Alerts list, click on the link in the yellow banner on the botton of the screen or navigate through the left-side navigation.

<img src="images/PC_OtherParts-QI04.png" height="60%" width="60%"/>

<br>
<br>

[Back to top](#)

<br>
<br>

## Send Quality Investigation to supplier

To send the Quality Investigation to the suppliers, there are 2 ways of doing so. On the Queued Quality Investigation list, it is possible to distribute a Quality Investigation by opening its options menu and clicking on "Distribute to customers"

<img src="images/PC_OtherParts-QI-Options.png" height="60%" width="60%"/>

<br>

On the Quality Investigation details page, it is possible to send the Quality Investigation by clicking on "Send request to supplier" button on the top right corner of the page.

<img src="images/PC_OtherParts-QI-Details.png" height="60%" width="60%"/>

<br>

Once the Quality Investigation request is sent, the suppliers (within the network) which parts are in the investigation, will receive a Quality Investigation request. On the supplier side, it will be shown in the Dashboard, on the Left-side navigation and on the Quality Investigation page on the "Received" list.

<img src="images/PC_Dashboard-QI2.png" height="60%" width="60%"/>
<img src="images/PC_QI_Received.png" height="60%" width="60%"/>


<br>

On the requester side, it will be shown in the on the Quality Investigations page on the "Requested" list and no more changes are allowed.

<img src="images/PC_QI-Requested.png" height="60%" width="60%"/>


<br>
<br>

[Back to top](#)

<br>
<br>

## Raise quality alert from quality investigation

To raise a Quality Alert from a Quality Investigation, on the Investigation details page, select the part(s) and click on "Change quality type" button

<img src="images/PC_QI_QAfromQI.png" height="60%" width="60%"/>

<br>

Choose the quality type for the part (Minor Issue, Major issue, Critical issue or Life-Threatning issue) and enter a discription

<img src="images/PC_QI_QAfromQI02.png" height="60%" width="60%"/>

<br>

By clicking on "Add to Queue" the quality type change will be added to the list of Queued Quality Alerts that pending distribuition to customers. Only after being distributed to customers will the Quality type of the part effectively change.

To distribute it, follow the steps on the section [Distribute quality alerts to customers](#distribute-quality-alerts-to-customers)


<br>
<br>

[Back to top](#)

<br>
<br>


## Raise quality investigation from quality investigation

To raise a Quality Investigation from a Quality Investigation, on the Investigation details page, view your part's child parts by clicking on the arrow next to thePart Name,  select the child part(s) and click on "Request Quality Investigation" button.

<img src="images/PC_QI-QIfromQI.png" height="60%" width="60%"/> 

<br>

Enter a description and click "Add to Queue"

<img src="images/PC_QI-QIfromQI02.png" height="60%" width="60%"/>

<br>

By clicking on "Add to Queue" the quality type change will be added to the list of Queued Quality Investigation that pending distribuition to suppliers. Only after being distributed to suppliers will the Quality investigation request be effectively sent.


<br>

To sent it to the suppliers, follow the steps on the section [Send Quality Investigation to supplier](#send-quality-investigation-to-supplier)


<br>
<br>

[Back to top](#)

<br>
<br>

## Access control

In the Access Control page, it is possible to manage your network,regarding which companies you'll be sharing your information. You can request access to a company, manage pending requests from companies, see the active connections and remove the access to those companies.

<img src="images/PC_AccessControl.png" height="60%" width="60%"/>

[Back to top](#)
