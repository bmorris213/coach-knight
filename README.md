# coach-knight
Coach Knight will take a look at all your games to discover weaknesses you have as a chess player. Based on these weaknesses, it will recommend avenues of study for you to persue.

### usage for Coach Knight chess bot
use 'npm start' to run normal condition program:
the program then allows you to:
* download:     to download your games from your website
* report:       to generate reports on downloaded games
* view:         view all generated reports
* quit:         gracefully exit program
but only if the user is logged in.

If you want to log in, or other options, use optional parameters.
To use optional parameters, use 'npm start -- [option]'
where the option can be any of the following:
* -h or --help      List program usage text.
* -l or --login     log user into a website for analysis.
* -r or --remove    Remove the current login information and game data.