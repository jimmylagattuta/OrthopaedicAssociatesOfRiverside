class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    csrf_token = form_authenticity_token
    search_term = 'orthopedic'
    location = 'Chicago, IL' # Specify the location here
    reviews = YelpCached.cached_yelp_reviews(search_term, location)

    render json: { reviews: reviews, csrf_token: csrf_token }
  rescue StandardError => e
    puts "Error in search_yelp_for_orthopedic: #{e.message}"
    render json: { "error": e.message }
  end

  require 'redis'
  require 'json'
  require 'uri'
  require 'net/http'
  require 'cgi' # Include CGI to escape search_term and location

  class YelpCached
    def self.remove_user_by_name(users, name)
      users.reject! { |user| user['user']['name'] == name }
    end

    def self.cached_yelp_reviews(search_term, location)
      redis = Redis.new(url: ENV['REDIS_URL'])
      cached_data = redis.get("cached_yelp_reviews_#{search_term}_#{location}")
      reviews = JSON.parse(cached_data) if cached_data

      if cached_data.present?
        # Parse the JSON data into an array of hashes
        users = JSON.parse(cached_data)

        # Call the class method to remove the user with name "Pdub .."
        remove_user_by_name(users, 'Pdub ..')

        # Convert the updated data back to a JSON string
        updated_reviews = JSON.generate(users)

        return updated_reviews
      end

      http = Net::HTTP.new("api.yelp.com", 443)
      http.use_ssl = true

      encoded_search_term = CGI.escape(search_term) # Use CGI.escape
      encoded_location = CGI.escape(location)       # Use CGI.escape

      url = URI("https://api.yelp.com/v3/businesses/search?term=#{encoded_search_term}&location=#{encoded_location}")
      request = Net::HTTP::Get.new(url)
      request["Accept"] = 'application/json'
      request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
      request["limit"] = "10" # You can adjust the limit as needed

      response = http.request(request)
      body = response.read_body
      parsed_response = JSON.parse(body)

      puts "Yelp API Response for search term '#{search_term}' in '#{location}':"
      puts parsed_response.inspect

      if parsed_response["error"]
        puts "Error: #{parsed_response['error']['description']}"
        return { reviews: [] }
      end

      # Extract and return the list of businesses from the search results
      businesses = parsed_response["businesses"]
      redis.set("cached_yelp_reviews_#{search_term}_#{location}", JSON.generate(businesses))
      redis.expire("cached_yelp_reviews_#{search_term}_#{location}", 30.days.to_i)

      return businesses
    rescue StandardError => e
      puts "Error in call_yelp: #{e.message}"
      return { "error": e.message }
    end
  end
end



# class Api::V1::JobsController < ApplicationController
#   def index
#     render json: "Midland Orthopedic Group " * 1000
#   end

#   def pull_yelp_cache
#     csrf_token = form_authenticity_token
#     search_terms = ['Orthopedic Associates of Riverside', 'Orthopaedic Associates of Riverside']
#     reviews = []

#     search_terms.each do |term|
#       term_reviews = YelpCached.cached_yelp_reviews(term)
#       reviews.concat(term_reviews) if term_reviews.is_a?(Array)
#     end

#     render json: { reviews: reviews, csrf_token: csrf_token }
#   rescue StandardError => e
#     puts "Error in pull_yelp_cache: #{e.message}"
#     render json: { "error": e.message }
#   end

#   require 'redis'
#   require 'json'
#   require 'uri'
#   require 'net/http'

#   class YelpCached
#     def self.remove_user_by_name(users, name)
#       users.reject! { |user| user['user']['name'] == name }
#     end

#     def self.cached_yelp_reviews(search_term)
#       redis = Redis.new(url: ENV['REDIS_URL'])
#       cached_data = redis.get('cached_yelp_reviews')
#       reviews = JSON.parse(cached_data) if cached_data

#       if cached_data.present?
#         # Parse the JSON data into an array of hashes
#         users = JSON.parse(cached_data)

#         # Call the class method to remove the user with name "Pdub .."
#         remove_user_by_name(users, 'Pdub ..')

#         # Convert the updated data back to a JSON string
#         updated_reviews = JSON.generate(users)

#         return updated_reviews
#       end

#       businesses = [
#         { alias: "orthopedic-associates-of-riverside" },
#       ]
#       http = Net::HTTP.new("api.yelp.com", 443)
#       http.use_ssl = true
#       reviews = []

#       businesses.each do |business|
#         business_url = URI("https://api.yelp.com/v3/businesses/#{business[:alias]}")
#         business_request = Net::HTTP::Get.new(business_url)
#         business_request["Accept"] = 'application/json'
#         business_request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
#         business_response = http.request(business_request)
#         business_body = business_response.read_body
#         business_parsed_response = JSON.parse(business_body)
#         next if business_parsed_response["error"]
#         business_location = {
#           location_one: business[:location],
#           location_two: business_parsed_response['location']['address1']
#         }
#         url = URI("https://api.yelp.com/v3/businesses/#{business[:alias]}/reviews")
#         request = Net::HTTP::Get.new(url)
#         request["Accept"] = 'application/json'
#         request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
#         request["limit"] = "3"
#         response = http.request(request)
#         body = response.read_body
#         parsed_response = JSON.parse(body)
#         if parsed_response["error"]
#           puts "Location: #{business[:location]}"
#           puts "Error: #{parsed_response['error']['description']}"
#           next
#         end
#         parsed_reviews = parsed_response["reviews"]
#         next if parsed_reviews.empty?
#         parsed_reviews.each do |review|
#           review["location_one"] = business_location[:location_one]
#           review["location_two"] = business_location[:location_two]
#           review["text"] = review["text"].strip # Remove leading/trailing spaces

#           # Adding puts statements to show each review
#           puts "Review:"
#           puts "Rating: #{review['rating']}"
#           puts "Text: #{review['text']}"
#           puts "Location One: #{review['location_one']}"
#           puts "Location Two: #{review['location_two']}"
#         end
#         limited_reviews = parsed_reviews.take(3)
#         limited_reviews.each do |review|
#           if review["rating"] == 5 && !reviews.any? { |r| r["id"] == review["id"] }
#             reviews << review
#           end
#         end
#       end

#       redis.set("cached_yelp_reviews", JSON.generate(reviews))
#       redis.expire("cached_yelp_reviews", 30.days.to_i)
#       cached_reviews = redis.get("cached_yelp_reviews")
#       reviews = JSON.parse(cached_reviews) if cached_reviews

#       if cached_reviews.present?
#         # Parse the JSON data into an array of hashes
#         users = JSON.parse(cached_reviews)

#         # Call the class method to remove the user with name "Pdub .."
#         remove_user_by_name(users, 'Pdub ..')

#         # Convert the updated data back to a JSON string
#         updated_reviews = JSON.generate(users)

#         return updated_reviews
#       end

#       return { reviews: "No cached reviews" }
#     rescue StandardError => e
#       puts "Error in call_yelp: #{e.message}"
#       render json: { "error": e.message }
#     end
#   end
# end