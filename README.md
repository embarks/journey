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
- [ ] inc 3: (poc) list all experiences
  - [ ] manual scrape
  - [ ] log
  - [ ] datfile
  - [x] inc 3.1: urls to reports
  - [x] inc 3.2: title / key / selector 
  - [ ] inc 3.3.0: calculate size required to store reports in datfiles
  - [ ] inc 3.3.1: store reports (?)
- [ ] inc 4: (admin) scrape command to update datfiles
- [ ] inc 5: distribute *
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
--urls       list all urls for the SUBSTANCE
```
