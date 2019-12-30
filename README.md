# journey
- experiences from the vault

- [x] inc 1: (poc) list all available substances
  - [x] manual scrape
  - [x] log
  - [x] datfile
- [x] inc 2: (poc) list all experiences for a substance key
  - [x] manual scrape
  - [x] log
  - [x] datfile
- [x] inc 3: (poc) list all experiences
  - [x] manual scrape
  - [x] log
  - [x] datfile
  - [x] inc 3.1: urls to reports
  - [x] inc 3.2: title / key / selector 
  - [ ] inc 3.3.0: calculate size required to store reports in datfiles
  - [x] inc 3.3.1: store reports (?)
- [ ] inc 3.5: refactor for efficiency and consumption
  - [x] questions: are experiences that had multiple substances repeated? **yes**
    - [ ] implications: folder structure
      - ~~storing experiences twice?~~
      - ~~group by all substances for the experience`~~
        - this makes analysis BY substance less efficient
        - *can detect if experiences are shared by the ID list?
        - negligible to store the ID list for each substance
        - only have to hit the domain once to get all the subtances
        - the number of times hitting the domain is known when the substance list is scraped, where it is unknown for ALL substances
      - [x] folder structure is bad for **consuming** the scrape
        - [x] name the file after all the substances with the delimiter, don't use a file structure
        *(note) on erowid the substance names have commas specifically to GROUP related substances, but the substance column is [,&] delimited*
          - [x] e.g. #2 [cannabis & nitrous-oxide]: Just Relax
          - [x] e.g. `#<id> <substance-1> & <substance-2> & ... <substance-n>: <report title>`
  - [ ] scraping ALL experiences should be handled as efficiently as possible 
    - [x] 2 api hits at most to get all the urls
  - [ ] tell the consumer ahead of time not to re-scrape experiences
- [x] inc 4: (admin) scrape command to update datfiles
- [ ] inc 5: distribute *
  - [ ] inc 5.0: (admin) get cli to work with basic commands
    - [ ] `smokem up` - initialize!
    - [ ] `smokem ?` - show available substances
    - [ ] `smokem SUBSTANCE` - get substance settings and prompt for report download
    - [ ] `smokem SUBSTANCE browse`
  - [ ] inc 5.1: (admin) publish command to update npm package
  - [ ] inc 5.2: (cli) make browsable
- [ ] inc 6: word frequency by substance analysis

\* _storage size must not be unreasonable (e.g. `fortune` brew package is 3.6MB)_

## usage

```
$ smokem SUBSTANCE
```

## arguments
```
?            list all substances
SUBSTANCE    name of the substance to get experiences
```

## options
```
-b  --browse       all urls for the SUBSTANCE in a browsable list
```
