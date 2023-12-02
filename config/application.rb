# config/application.rb

require_relative "boot"

require "rails/all"
require 'dotenv'
Dotenv.load('.env') if Rails.env.development? || Rails.env.test?

Bundler.require(*Rails.groups)

module RiversideOrthos
  class Application < Rails::Application
    config.load_defaults 7.0

    config.middleware.use Rack::Deflater

    config.middleware.use ActionDispatch::Cookies
    config.middleware.use ActionDispatch::Session::CookieStore
    config.action_dispatch.cookies_same_site_protection = :lax
    config.api_only = false
  end
end
