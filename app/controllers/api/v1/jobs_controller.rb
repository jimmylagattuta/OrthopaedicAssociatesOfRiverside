# class Api::V1::JobsController < ApplicationController
#     def index
#       render json: "Los Angeles Orthopedic Group " * 1000
#     end
  
#     def pull_google_places_cache
#       csrf_token = form_authenticity_token
#       reviews = GooglePlacesCached.cached_google_places_reviews
#       puts "*" * 100
#       puts "reviews"
#       puts reviews.inspect
#       puts "*" * 100
#       render json: { reviews: reviews, csrf_token: csrf_token }
#     end
#   end
  
#   class GooglePlacesCached
#     require 'redis'
#     require 'json'
#     require 'uri'
#     require 'net/http'
#     def self.remove_user_by_name(users, name)
#         users.reject! { |user| user['user'] && user['user']['name'] == name }
#       end
      
  
#     def self.cached_google_places_reviews
#       redis = Redis.new(url: ENV['REDIS_URL'])
#       cached_data = redis.get('cached_google_places_reviews')
#       reviews = JSON.parse(cached_data) if cached_data
#       if cached_data.present?
#         # Parse the JSON data into an array of hashes
#         users = JSON.parse(cached_data)
  
#         # Call the class method to remove the user with name "Pdub .."
#         remove_user_by_name(users, 'Pdub ..')
#         filtered_reviews = users.select { |review| review['rating'] == 5 }
  
#         # Convert the updated data back to a JSON string
#         updated_reviews = JSON.generate(filtered_reviews)
#         return updated_reviews
#       end
#       place_ids = [
#         'ChIJw42vkJw6DogRY9-m7dFcV_k'
#       ]
#       http = Net::HTTP.new("maps.googleapis.com", 443)
#       http.use_ssl = true
#       reviews = []
#       place_ids.each do |place_id|
#         encoded_place_id = URI.encode_www_form_component(place_id)
#         url = URI("https://maps.googleapis.com/maps/api/place/details/json?place_id=#{encoded_place_id}&key=#{ENV['REACT_APP_GOOGLE_PLACES_API_KEY']}")
#         request = Net::HTTP::Get.new(url)
#         response = http.request(request)
#         body = response.read_body
#         parsed_response = JSON.parse(body)
  
#         if parsed_response['status'] == 'OK'
#           place_details = parsed_response['result']
#           place_reviews = place_details.present? ? place_details['reviews'] || [] : []
#           reviews.concat(place_reviews)
#         else
#           puts "Failed to retrieve place details for place ID: #{place_id}"
#         end
#       end
  
#       redis.set("cached_google_places_reviews", JSON.generate(reviews))
#       redis.expire("cached_google_places_reviews", 30.days.to_i)
#       cached_reviews = redis.get("cached_google_places_reviews")
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
#     end
# end


class Api::V1::JobsController < ApplicationController
  def index
    render json: "Midland Orthopedic Group " * 1000
  end

  def pull_yelp_cache
    reviews = YelpCached.cached_yelp_reviews

    render json: reviews
  rescue StandardError => e
    puts "Error in pull_yelp_cache: #{e.message}"
    render json: { "error": e.message }
  end
  
  require 'redis'
  require 'json'
  require 'uri'
  require 'net/http'

  class YelpCached
      def self.remove_user_by_name(users, name)
          users.reject! { |user| user['user']['name'] == name }
      end

      def self.cached_yelp_reviews
          redis = Redis.new(url: ENV['REDIS_URL'])
          cached_data = redis.get('cached_yelp_reviews')
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

          businesses = [
              { alias: "orthopedic-associates-of-riverside-riverside", location: "Chicago" },
              { alias: "orthopedic-associates-of-riverside-riverside", location: "La Grange" },
              { alias: "orthopedic-associates-of-riverside-riverside", location: "Riverside" },
              { alias: "orthopaedic-associates-of-riverside-riverside", location: "Chicago" },
              { alias: "orthopaedic-associates-of-riverside-riverside", location: "La Grange" },
              { alias: "orthopaedic-associates-of-riverside-riverside", location: "Riverside" },

              { alias: "orthopedic-associates-of-riverside-chicago", location: "Chicago" },
              { alias: "orthopedic-associates-of-riverside-chicago", location: "La Grange" },
              { alias: "orthopedic-associates-of-riverside-chicago", location: "Riverside" },
              { alias: "orthopaedic-associates-of-riverside-chicago", location: "Chicago" },
              { alias: "orthopaedic-associates-of-riverside-chicago", location: "La Grange" },
              { alias: "orthopaedic-associates-of-riverside-chicago", location: "Riverside" },



              { alias: "orthopedic-associates-of-riverside-la-grange", location: "Chicago" },
              { alias: "orthopedic-associates-of-riverside-la-grange", location: "La Grange" },
              { alias: "orthopedic-associates-of-riverside-la-grange", location: "Riverside" },
              { alias: "orthopaedic-associates-of-riverside-la-grange", location: "Chicago" },
              { alias: "orthopaedic-associates-of-riverside-la-grange", location: "La Grange" },
              { alias: "orthopaedic-associates-of-riverside-la-grange", location: "Riverside" },

          ]
          http = Net::HTTP.new("api.yelp.com", 443)
          http.use_ssl = true
          reviews = []
          businesses.each do |business|
              business_url = URI("https://api.yelp.com/v3/businesses/#{business[:alias]}")
              business_request = Net::HTTP::Get.new(business_url)
              business_request["Accept"] = 'application/json'
              business_request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
              business_response = http.request(business_request)
              business_body = business_response.read_body
              business_parsed_response = JSON.parse(business_body)
              next if business_parsed_response["error"]
              business_location = {
                  location_one: business[:location],
                  location_two: business_parsed_response['location']['address1']
              }
              url = URI("https://api.yelp.com/v3/businesses/#{business[:alias]}/reviews")
              request = Net::HTTP::Get.new(url)
              request["Accept"] = 'application/json'
              request["Authorization"] = "Bearer #{ENV['REACT_APP_YELP_API_KEY']}"
              request["limit"] = "3"
              response = http.request(request)
              body = response.read_body
              parsed_response = JSON.parse(body)
              if parsed_response["error"]
                  puts "Location: #{business[:location]}"
                  puts "Error: #{parsed_response['error']['description']}"
                  next
              end
              parsed_reviews = parsed_response["reviews"]
              next if parsed_reviews.empty?
              parsed_reviews.each do |review|
                  review["location_one"] = business_location[:location_one]
                  review["location_two"] = business_location[:location_two]
                  review["text"] = review["text"].strip # Remove leading/trailing spaces
              end
              limited_reviews = parsed_reviews.take(3)
              limited_reviews.each do |review|
                  if review["rating"] == 5 && !reviews.any? { |r| r["id"] == review["id"] }
                      reviews << review
                  end
              end
          end

          redis.set("cached_yelp_reviews", JSON.generate(reviews))
          redis.expire("cached_yelp_reviews", 30.days.to_i)
          cached_reviews = redis.get("cached_yelp_reviews")
          reviews = JSON.parse(cached_reviews) if cached_reviews

          if cached_reviews.present?
              # Parse the JSON data into an array of hashes
              users = JSON.parse(cached_reviews)

              # Call the class method to remove the user with name "Pdub .."
              remove_user_by_name(users, 'Pdub ..')

              # Convert the updated data back to a JSON string
              updated_reviews = JSON.generate(users)

              return updated_reviews
          end

          return { reviews: "No cached reviews" }
      rescue StandardError => e
          puts "Error in call_yelp: #{e.message}"
          render json: { "error": e.message }
      end
  end


end