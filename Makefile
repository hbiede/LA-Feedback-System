default: clean local_build upload

test: clean local_build upload_test

local_build:
	yarn run eslint
	cp -r public build
	yarn run build
	rm -rf ./build/.idea

upload:
	ssh learningassistants@cse.unl.edu "mv public_html/LA-Feedback/log ~; rm -rf ~/public_html/LA-Feedback"
	scp -r ./build learningassistants@cse.unl.edu:~/public_html/LA-Feedback
	ssh learningassistants@cse.unl.edu "mv ~/log public_html/LA-Feedback/; chmod 700 public_html/LA-Feedback/data/ public_html/LA-Feedback/log public_html/LA-Feedback/programUpdate.php"

upload_test:
	ssh learningassistants@cse.unl.edu "rm -rf ~/public_html/LA-Feedback-Test"
	scp -r ./build learningassistants@cse.unl.edu:~/public_html/LA-Feedback-Test
	ssh learningassistants@cse.unl.edu "mkdir ~/public_html/LA-Feedback-Test/log; chmod 700 public_html/LA-Feedback-Test/data/ public_html/LA-Feedback-Test/log public_html/LA-Feedback-Test/programUpdate.php"

clean:
	rm -rf ./build

