SUCCESS webhook api
===================

Webhook api to receive data changes from Vietnamworks

Table of contents
---
  * [Required request header] (#required-request-header)
  * [Job](#job)
    * [Insert job](#insert-job)
    * [Update job](#update-job)
    
  * [Application](#application)
    * [Insert application](#insert-application)
    * [Update application](#update-application)

----------

Required request header
=======================
Success web hook use the same header for all requests

Name           | Value
-------------- | ---
accept         | `application/json`
content-type   | `application/json`
x-access-token | [REQUEST_TOKEN]

Job
===
### Insert Job
> Post to webhook when job inserted from Vietnamworks.com

- Endpoint:  `/webhook/job`
- Method: POST
- Request content:  

Name      | Type
--------- | ---
companyId | Number
userId    | Number
jobId     | Number

- Reponse: 200 and no content

#### Example
##### PHP
```php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "http://success.vietnamworks.com/webhook/job",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => "{\"companyId\" : 343, \"jobId\" : 1234321, \"userId\" : 123}",
  CURLOPT_HTTPHEADER => array(
    "accept: application/json",
    "content-type: application/json",
    "x-access-token: [TOKEN]"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

##### CURL

```shell
curl -X POST \
	-H "Accept: application/json" \
	-H "Content-Type: application/json" \
	-H "x-access-token: [TOKEN]" \
	-d '{"companyId" : 343, "jobId" : 1234321, "userId" : 123}' 'http://success.vietnamworks.com/webhook/job'
```

### Update Job
> Post to webhook when job updated from Vietnamworks.com

- Endpoint:  `/webhook/job`
- Method: PUT
- Request content:  

Name      | Type
--------- | ---
companyId | Number
userId    | Number
jobId     | Number

- Reponse: 200 and no content

#### Example
##### PHP
```php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "http://success.vietnamworks.com/webhook/job",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "PUT",
  CURLOPT_POSTFIELDS => "{\"companyId\" : 343, \"jobId\" : 1234321, \"userId\" : 123}",
  CURLOPT_HTTPHEADER => array(
    "accept: application/json",
    "content-type: application/json",
    "x-access-token: [TOKEN]"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

##### CURL

```shell
curl -X PUT \
	-H "Accept: application/json" \
	-H "Content-Type: application/json" \
	-H "x-access-token: [TOKEN]" \
	-d '{"companyId" : 343, "jobId" : 1234321, "userId" : 123}' 'http://success.vietnamworks.com/webhook/job'
```

## Application
### Insert application
> send request to webhook when job inserted from Vietnamworks.com

- Endpoint:  `/webhook/application`
- Method: POST
- Request content:  

Name      | Type
--------- | ---
jobId     | Number
entryId   | Number (`entryid` if application applied online, `sdid` if application sent directly)  
source    | Number ( `1` is applied online, `2` is sent directly )

- Reponse: 200 and no content

#### Example

##### CURL

```shell
curl -X POST \
	-H "Accept: application/json" \
	-H "Content-Type: application/json" \
	-H "x-access-token: [TOKEN]" \
	-d '{"jobId": 561260, "entryId": 14078506, "source": 2}' 'http://success.vietnamworks.com/webhook/application'
```

##### PHP

```php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "http://success.vietnamworks.com/webhook/application",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => "{\"jobId\": 561260, \"entryId\": 14078506, \"source\": 2}",
  CURLOPT_HTTPHEADER => array(
    "accept: application/json",
    "content-type: application/json",
    "x-access-token: [TOKEN]"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

### Update application
> send request to webhook when application updated from Vietnamworks.com

- Endpoint:  `/webhook/application`
- Method: PUT
- Request content:  

Name      | Type
--------- | ---
jobId     | Number
entryId   | Number (`entryid` if application applied online, `sdid` if application sent directly)  
source    | Number ( `1` is applied online, `2` is sent directly )

- Reponse: 200 and no content


#### Example

##### CURL

```shell
curl -X PUT \
	-H "Accept: application/json" \
	-H "Content-Type: application/json" \
	-H "x-access-token: [TOKEN]" \
	-d '{"jobId": 561260, "entryId": 14078506, "source": 2}' 'http://success.vietnamworks.com/webhook/application'
```

##### PHP

```php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "http://success.vietnamworks.com/webhook/application",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "PUT",
  CURLOPT_POSTFIELDS => "{\"jobId\": 561260, \"entryId\": 14078506, \"source\": 2}",
  CURLOPT_HTTPHEADER => array(
    "accept: application/json",
    "content-type: application/json",
    "x-access-token: [TOKEN]"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
```

