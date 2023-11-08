# Version 1.0.5

- Change default column width from 100ch to 10ch

## Version 1.0.4

- Add cache option to adjust how long the results are cached for 
	-	⚠️ Defaults to 300 seconds, ie. 5min (previous default was 30 seconds)
	- Does update when variables change
- Improved feedback on missing variables (uses info instead of error)

## Version 1.0.3

- Support sqlite and mssql
	- Partial support for 'CALL' statements

## Version 1.0.2

- Add event emitter to allow other extensions to listen to events
	- 'sql-query:request' - Fired before variables are replaced in the query
	- 'sql-query:response' - Fired after the query has been executed

## Version 1.0.1

- Update sumary row basedo on searched results

## Version 1.0.0

First release