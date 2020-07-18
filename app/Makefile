default: local_build upload

local_build:
	npm run build

upload:
	ssh learningassistants@cse.unl.edu "rm -rf ~/public_html/LA-Feedback"
	scp -r ./build learningassistants@cse.unl.edu:~/public_html/LA-Feedback
	ssh learningassistants@cse.unl.edu "mkdir ~/public_html/LA-Feedback/log"
