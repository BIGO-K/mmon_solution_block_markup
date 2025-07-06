# __ui__solution__block
+ 엠몬 전체일정 https://docs.google.com/spreadsheets/d/1ZNsKeZrZAr2o6DdYGvnWOHJsOPCGyQJgjerCMU5jhUY/edit#gid=425404578
+ 기획 구글드라이브 경로
+ 디자인 구글드라이브 경로 https://docs.google.com/spreadsheets/d/17rZa7t6h5t_oplHYtAPDIfUzDYsf62NO/edit#gid=253575788
+ 퍼블리싱 작업 리스트 
	- PC:: https://publish.mmonstar.co.kr/solution/block/pc/
	- Mobile:: https://publish.mmonstar.co.kr/solution/block/mobile/
<br><br>

## 작업환경
+ vscode에서 작업할 경우 **SFTP** 를 이용하면 FTP에 바로 업로드됩니다.
	- SFTP의 **sftp.json** 파일설정
		```
		"name": "ftp",
		"host": "1.xxx.xx.x2",
		"protocol": "sftp",
		"port": 8023,
		"username": "mmon_publish",
		"password": "비밀번호",
		"remotePath": "/home/mmon_publish/html/solution/block/",(실서버)
		"remotePath": "/home/mmon_publish/_merge/html/solution/block/",(FTP전달용)
		"remotePath": "/home/mmon_publish/작업자/html/solution/block/",(서브 작업자 설정방식)
		"uploadOnSave": true,
		...
		"watcher": {
			"files": "**",
			"autoUpload": false,
			"autoDelete": false
		},
		"ignore": [".vscode", ".git", ".DS_Store"]
		...
		```
	- css, fonts, html, js, scss, image 등 모든 폴더에 watch가 걸려있어 변화가 생기면 자동으로 업로드됩니다.
	- images 폴더는 포토샵에서 save for web을 할 때 파일이 생성되는 시점이 달라 오류 발생할 수 있습니다. (이슈 발생 시 ignore에 추가 테스트 필요)
	- 동기화가 되어 따로 파일을 삭제하지 않아도 됩니다.

- - -
## 작업관련 문서 확인 경로
+ HTML https://github.com/m-monstar/__ui__solution__v2/wiki/HTML
+ CSS/SCSS https://github.com/m-monstar/__ui__solution__v2/wiki/CSS-SCSS
+ JAVASCRIPT https://github.com/m-monstar/__ui__solution__v2/wiki/JAVASCRIPT
+ EMAIL TEMPLATE https://github.com/m-monstar/__ui__solution__v2/wiki/Email-Template
