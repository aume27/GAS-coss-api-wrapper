
# G.A.S. coss api wapper
---
This library was made using [Google App Script(GAS)](https://developers.google.com/apps-script/) and the [coss.io api service](https://api.coss.io/v1/spec#api-Order-orderDetailsPost).

It allows to communicate with Coss exchange platform from Google services like google websites,

docs and sheets and provide the core functions to retrieve and send request.

It does not format the response for a specified service, this requires you to

build a custom function in addition. There is examples available here: [test-examples.js](test-examples.js).

---
### Coss.io api side details:
- User must provide the public api key in Authorization header and      
  signed payload in Signature header.
- Timestamp and recvWindow are for future release and currently not used
  for request timeout, however for signed GET requests the signed
  payload must be provided: `recvWindow=5000&timestamp=12345678`
- Throttling is now set to 1 request every second, this will change over
  the coming weeks.
- After creation of a new order, a response code `200` is sent when
  order created successfully.
- `stop_price` in order request and response is not used. The field is  
  for future release.
- Completed orders not returning orders which were created before public
  API release.
- Market Orders are not currently supported. Please use Limit Orders.

### G.A.S side details:
- A script that uses a library does not run as quickly as
  single script project. Recommend to copy this code to
  a script file in your project.
- Can't call anonym functions contained in an object from
  spreadsheet. The Variable.functionName() structure is
  reserved for library *IdenfierName* in googleAppScript.
- Can't send an object as function parameter from
  spreadsheet,params must be hard coded.
- `Get` method doesn't handle payloads using UrlFetchApp,
  *concat* `query_params` to `url`.
- Will not automatically arrange the response object to
  fit spreadsheets.

---
## Setup

### Step 1
First install the script as a library or make a copy of the script project.

##### As a library
1. In your googleAppScript editor, click on the menu item "Resources > Libraries..."
2. In the text field at the bottom of the box, enter the script ID,
`1cWkV_FH6b3O3qwRBR1mrOVyIep3v3ZNEiMnZjObuJo610KqZzGSWlIYD`
and click the "Select" button.
3. Choose a version in the dropdown box (usually best to pick the latest version).
4. Check to see if the default *`IdenfierName`* is the one that you would like to use
with this library. This is the name that your script uses to refer to the library.
For example, if you set it to `Test` then you could call a method of that library
as follows: `Test.libraryMethod()`
5. Click the "Save" button.

##### As a Standalone Script copy owned by you
Simply make a copy of the script project and rename it.

https://script.google.com/d/1cWkV_FH6b3O3qwRBR1mrOVyIep3v3ZNEiMnZjObuJo610KqZzGSWlIYD/edit?usp=sharing

*(Using this method, your copy will not be touched by changes made on the original library.
It will be necessary to make a new copy of it if you want to update to the latest version.)*

### Step 2
After you have it setup, you will need to provide your credentials
```
   var apiKey = 'YOUR_PUBLIC_API_KEY';
   var apiSecret = 'YOUR_API_SECRET_KEY';
```
##### As a library
In the script that is linked to this library set the variables mentioned above with your **appropriate credentials as *strings***.

To do so you will need to access the variable using your IdenfierName and then assign it a new value. e.g:

`IdenfierName.apiKey = "YOUR_PUBLIC_API_KEY";`

`IdenfierName.apiSecret = "YOUR_API_SECRET_KEY";`

*(Note that if you create variables or functions that have the same name then your library idenfierName, it will overwrite it.)*

##### Script copy owned by you
In the [api-wapper.js file](api-wapper.js) file, replace the `placeHolders` shown above by your **appropriate credentials as *strings***

and you're ready to go!

---
#### Credits
- @cryptodeal, This Google App Script is based on the Node.Js
  Coss-api-wapper created by @cryptodeal.
  Source: https://github.com/cryptodeal/Coss-API-Node
- @manucart for his cryptocurrency-portfolio.
  Used as example from other exchanges
  Source: https://github.com/ManuCart/Cryptocurrency-Portfolio

#### Author
Guillaume MD
email: gmd2791@gmail.com
[Twitter account @27aume](https://twitter.com/@27aume)

#### Donation	and feedback
- If you have any recommendation, feel free to email me directly.
- For comment about the code please add the line you're referring to.
- Your support is greatly appreciated.
		BTC:	1G2bT7cqqi1hVRn2HQ2yackqHy5aZFLboG
		LTC:	MM6F58UueZxN83hr3XvAMG4GbtHXp8qjDu
		ETH and ERC tokens:	0x81Be7262a55B98c5C503aB3d60A64102cC4E4B27
