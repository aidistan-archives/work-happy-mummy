#!/usr/bin/env ruby
require 'rake'

FileList['*.jpg', '*.png'].each do |file|
  `mv '#{file}' basket_#{file}`
end
