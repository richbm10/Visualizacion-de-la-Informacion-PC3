# Read World Population
world_population = open('world_population.csv', 'r') 
lines = world_population.readlines() 

# Create Dictionary for Codes of Countries
countries = dict()

# Set the Country Code for each Country Name
for line in lines:
    words = line.split(",")
    countries[words[0]] = words[1]

# Delete first row
del countries['name']
world_population.close()

# Read Happiness (2019)
happiness = open('2019.csv', 'r')
lines = happiness.readlines()

# Create new countries
new_countries = []

# Set new countries with code
for line in lines:
    country_name = line.split(",")[1]
    country_code = countries.get(country_name, None)
    if country_code == None:
        print(country_name)
    else:
        new_line = line[:-1] + "," + countries[country_name] + "\n"
        new_countries.append(new_line)
    

# Write Happiness (with Code)
new_file = open('happiness2.csv', 'w')
header = "Overall rank,Country or region,Score,GDP per capita,Social support,Healthy life expectancy,Freedom to make life choices,Generosity,Perceptions of corruption, code\n" 
new_lines = [header] + new_countries
new_file.writelines(new_lines)