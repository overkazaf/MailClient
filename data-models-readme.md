#data-models 
#MailConfig
```
	config = {
		protocol : 'SMTP',
		services : {
		    service:"Gmail",
		    auth: {
		        user: 'user@gmail.com',
		        pass: 'password'
		    }
		},
		option : MailOption
	}
```
#Mail
```
	mail = {
		from : 'xxx@gmail.com',
	    to: 'xxx@qq.com, yyy@qq.com',
	    subject: 'xxx',
	    content: 'xxx',
	    html: '<b>Hello world 🐴</b>' // html body
	}
```
