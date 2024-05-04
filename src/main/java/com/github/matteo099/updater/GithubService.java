package com.github.matteo099.updater;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;

@RegisterRestClient(configKey = "github-api")
@Path("/repos")
public interface GithubService {
    @GET
    @Path("/{owner}/{repo}/releases/latest")
    @Produces("application/json")
    Release getLatestRelease(@PathParam("owner") String owner, @PathParam("repo") String repo);
}
