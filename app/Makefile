default: clean local_build upload

local_build:
	yarn eslint
	yarn build
	rm -rf ./build/.idea

upload:
	ssh learningassistants@cse.unl.edu "rm -rf ~/public_html/LA-Feedback"
	scp -r ./build learningassistants@cse.unl.edu:~/public_html/LA-Feedback
	ssh learningassistants@cse.unl.edu "mkdir ~/public_html/LA-Feedback/log; chmod 700 public_html/LA-Feedback/data/ public_html/LA-Feedback/log"

clean:
	rm -rf ./build

