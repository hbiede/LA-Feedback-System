default: clean local_build upload

local_build:
	npm run eslint
	npm run build
	rm -rf ./build/.idea

upload:
	ssh learningassistants@cse.unl.edu "rm -rf ~/public_html/LA-Feedback"
	scp -r ./build learningassistants@cse.unl.edu:~/public_html/LA-Feedback
	ssh learningassistants@cse.unl.edu "mkdir ~/public_html/LA-Feedback/log; chmod -R 755 public_html/LA-Feedback/*; chmod 700 public_html/LA-Feedback/data/"

clean:
	rm -rf ./build

