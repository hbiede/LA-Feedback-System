default: clean local_build upload

local_build:
	yarn eslint
	cp -r public build
	yarn webpack --mode production --config webpack.config.ts
	rm -rf ./build/.idea

upload:
	ssh learningassistants@cse.unl.edu "rm -rf ~/public_html/LA-Feedback"
	scp -r ./build learningassistants@cse.unl.edu:~/public_html/LA-Feedback
	ssh learningassistants@cse.unl.edu "mkdir ~/public_html/LA-Feedback/log; chmod 700 public_html/LA-Feedback/data/ public_html/LA-Feedback/log public_html/LA-Feedback/programUpdate.php"

clean:
	rm -rf ./build

